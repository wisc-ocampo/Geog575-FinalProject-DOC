//insert code here!
(function(){

    //pseudo-global variables
    var attrArray = []; //list of months
    for (let i = 1; i < 245; i++) {
        attrArray.push(`month_${i}`);
    }
    var projection;

    var expressed = attrArray[2]; //initial attribute

    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
function setMap(){

    //map frame dimensions
    var width = window.innerWidth * .8,
        height = window.innerHeight * .75;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map");

        const box = document.getElementById(`map`);
        box.style.position = 'absolute';
        box.style.top = 1;
        box.style.left = 1;


    //create Equal Earth equal area projection
    projection = d3.geoEqualEarth()
        .center([0, 5])
        .rotate([-10, 0, 0])
        .scale(window.innerWidth / 6.75)
        .translate([width / 2, height / 2]);
        
    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/world.csv")); //load attributes from csv    
    promises.push(d3.json("data/CMSSimp4.topojson")); //load spatial data    
    Promise.all(promises).then(callback);

    function callback(data){               
        var csvData = data[0], countries = data[1];

        var baseCountries = topojson.feature(countries, countries.objects.CMSSimp4),
                worldCountries = topojson.feature(countries, countries.objects.CMSSimp4).features;

        setGraticule (map, path);

        var base = map.append("path")
            .datum(baseCountries)
            .attr("class", "baseCountries")
            .attr("d", path);

        //join csv data to GeoJSON enumeration units
        worldCountries = joinData(worldCountries, csvData);

        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale, csvData); 
        setChart(csvData, colorScale) ;     
        reexpressButtons(csvData);  
    };
}; //end of setMap()

//join topojson with csv data
function joinData(worldCountries, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvCountry = csvData[i]; //the current region
        var csvKey = csvCountry.SOVEREIGNT; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){

            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.SOVEREIGNT; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvCountry[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
    return worldCountries;
};

//create units and set choropleth coloring and cartogram sizing
function setEnumerationUnits(worldCountries, map, path, colorScale){
    
    //set non-contiguous cartogram scaling
    function transform(d, expressed) {
        const [x, y] = path.centroid(d);

        if (d.properties[expressed] > 0){
        return `
          translate(${x},${y})
          scale(${Math.sqrt(d.properties[expressed]*.01)})
          translate(${-x},${-y})
        `; 
        } else {
        return `
          translate(${x},${y})
          scale(${Math.sqrt(.01)})
          translate(${-x},${-y})
        `;
        }
      }

    //add countries to map
    var countries = map.selectAll(".countries")
        .data(worldCountries)
        .enter()
        .append("path")
        .attr("id", function(d){
            return "country " + d.properties.countryData;
        })
        .attr("class", function(d){
            return "country " + d.properties.subregion;
        })
        .attr("d", path)
        .style("fill", function(d){
            if (d.properties[expressed] > 0){
                return colorScale(d.properties[expressed])
            } else {return "#676767"}
        })
        .style("stroke", function(d){
            if (d.properties[expressed] > 0){
                return "none"
            } else {return "black"}
        })
        
        .attr("transform", d => transform(d, expressed));
};

//create sequential color scale
function makeColorScale(){

    const interpolation = d3
        .scaleSequential([0,100], d3.interpolateReds);
    return interpolation
};

function setGraticule(map, path){
    const graticule = d3.geoGraticule().step([10, 10]);
    
    const gratBackground = map
        .append('path')
        .datum(graticule.outline())
        .attr('class', 'gratBackground')
        .attr("d", d3.geoPath().projection(projection));

    const gratLines = map
        .datum(graticule())
        .append('path')
        .attr('class', 'gratLines')
        .attr("d", d3.geoPath().projection(projection));
   };
function setChart(csvData, colorScale){
    var chartWidth = window.innerWidth *.8;
    var chartHeight = window.innerHeight * .35;

    // Margin for axis
    var margin = { top: 20, right: 20, bottom: 20, left: 40 };
    var width = chartWidth - margin.left - margin.right;
    var height = chartHeight - margin.top - margin.bottom;

    // Scales for x and y axes
    const xScale = d3.scaleLinear().domain([1, 244]).range([0, width]); // Adjust domain as needed
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 10]); // Adjust domain as needed


    var chart = d3
        .select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart")
        .attr("id", "chart");
        
        const box = document.getElementById(`chart`);
        box.style.position = 'absolute';
        box.style.top = window.innerHeight * .625;
        box.style.left = 1;

    // Append a group for margin handling
    var g = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")").call(d3.axisBottom(xScale));
    g.append("g")
        .call(d3.axisLeft(yScale))
        .call(g => g.append("text")
            .attr("x", -25)
            .attr("y", -3)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text("Trend Value (%)"));

    // Line generator
    const line = d3.line().x((d, i) => xScale(i + 1)).y((d) => yScale(d));
    
    // Create tooltip div (initially hidden)
    var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #d3d3d3")
        .style("padding", "5px")
        .style("display", "none");

    // Plot lines for each country
    var lines = g.selectAll(".country-line")
        .data(csvData)
        .enter()
        .append("path")
        .attr("class", (d) => "country-line " + d.SOVEREIGNT)
        .attr("d", (d) => {
            var values = Object.keys(d)
            .filter((key) => key.startsWith("month_"))
            .map((key) => parseFloat(d[key]));
            return line(values);
        })
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2)
        .attr("fill", "none");
    
    lines.on("mouseover", function (event, d) {
      // Highlight the hovered line
      d3.select(this)
        .attr("stroke", "yellow") // Change to desired color
        .attr("stroke-width", 3); // Make it a bit thicker

    // Calculate the month index from the mouse position
    const mouseX = d3.pointer(event, g.node())[0];
    const monthIndex = Math.round(xScale.invert(mouseX));
  
    // Get the value for this month
    const monthValue = d[`month_${monthIndex}`] || "No data";

    
    // Update tooltip with current value
  tooltip
    .html(
        `Country: ${d.SOVEREIGNT}<br>Subregion: ${d.subregion}<br>Month ${monthIndex}: ${monthValue}`
    )
    .style("left", `${event.pageX + 10}px`) // Adjust to prevent overlapping
    .style("top", `${event.pageY - 10}px`) // Adjust for tooltip position
    .style("display", "block");

    // Fade other lines
    lines.filter((other) => other !== d)
        .attr("stroke-opacity", 0.1); // Adjust to desired opacity level
    })
    .on("mouseout", function (event, d) {
      // Reset the line style
        d3.select(this)
            .attr("stroke", "#ccd")
            .attr("stroke-width", 2); // Reset thickness

        // Hide tooltip
        tooltip.style("display", "none");

        // Reset other lines' opacity
        lines
            .attr("stroke-opacity", 1); // Reset to full opacity
    });          
}

function reexpressButtons(csvData){
    const worldButton = document.createElement('button');
    worldButton.innerText = 'relative to USA';
    worldButton.id = 'worldButton';
    worldButton.class = 'button';
    worldButton.addEventListener("click", function(event, d){
        changeExpression();
    })
    document.body.appendChild(worldButton);


    const regionButton = document.createElement('button')
    regionButton.innerText = 'relative to local region';
    regionButton.id = 'regionButton';
    regionButton.class = 'button';
    regionButton.addEventListener("click", function(event, d){
        changeExpression();
    })
    document.body.appendChild(regionButton)

    function changeExpression(){
        worldButton.innerText = "test";
    }
}
})();
