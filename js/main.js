//insert code here!
(function(){

    //pseudo-global variables
    // Define unique subregions and create color scale
    const uniqueSubregions = [
        "Antarctica",
        "Australia and New Zealand",
        "Caribbean",
        "Central America",
        "Central Asia",
        "Eastern Africa",
        "Eastern Asia",
        "Eastern Europe",
        "Indeterminate",
        "Melanesia",
        "Micronesia",
        "Middle Africa",
        "Northern Africa",
        "Northern America",
        "Northern Europe",
        "Polynesia",
        "South America",
        "South-Eastern Asia",
        "Southern Africa",
        "Southern Asia",
        "Southern Europe",
        "Western Africa",
        "Western Asia",
        "Western Europe"
    ];
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
        height = window.innerHeight * .7;

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
    promises.push(d3.json("data/_110mCountries.topojson")); //load spatial data 
    promises.push(d3.csv("data/World_POI.csv"))   
    Promise.all(promises).then(callback);

    function callback(data){               
        var csvData = data[0], countries = data[1], worldEventData = data[2]
        

        var test = countries.objects;
        //console.log(test);

        var baseCountries = topojson.feature(countries, countries.objects._110mCountries),
                worldCountries = topojson.feature(countries, countries.objects._110mCountries).features;

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
        setChart(csvData, worldEventData) ;     
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

function setChart(csvData, worldEventData) {
    var chartWidth = window.innerWidth * 0.8;
    var chartHeight = window.innerHeight * 0.45;

    // Margin for axis
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    // Scales for x and y axes
    const xScale = d3.scaleLinear().domain([1, 240]).range([0, width]); // Adjust domain if needed
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]); // Adjust domain if needed

    const regionColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(
        csvData.map((d) => d.subregion)
    );

    var chart = d3
        .select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart")
        .attr("id", "chart");

    const box = document.getElementById("chart");
    box.style.position = "absolute";
    box.style.top = `${window.innerHeight * 0.55}px`;
    box.style.left = "1px";

    // Append a group for margin handling
    var g = chart.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X and Y axes
    g.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    g.append("g").call(d3.axisLeft(yScale)).append("text")
        .attr("x", -25)
        .attr("y", -3)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text("Trend Value (%)");

    // Line generator
    const line = d3.line().x((d, i) => xScale(i + 1)).y((d) => yScale(d));

    // Create tooltip div
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
    var lines = g
        .selectAll(".country-line")
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
        .attr("stroke", (d) => regionColorScale(d.subregion))
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Add tooltip interaction for lines
    lines
        .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke", "yellow").attr("stroke-width", 4);

            const mouseX = d3.pointer(event, g.node())[0];
            const monthIndex = Math.round(xScale.invert(mouseX));

            const monthValue = d[`month_${monthIndex}`] || "No data";

            tooltip
                .html(
                    `Country: ${d.SOVEREIGNT}<br>Subregion: ${d.subregion}<br>Month ${monthIndex}: ${monthValue}`
                )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .style("display", "block");

            // Fade other lines
            lines.filter((other) => other !== d).attr("stroke-opacity", 0.1);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("stroke", (d) => regionColorScale(d.subregion))
                .attr("stroke-width", 2);

            tooltip.style("display", "none");

            lines.attr("stroke-opacity", 1);
        });
       // console.log("!!!!!!!!!!!!")

       const getMonthIndex = (date) => {
        // Check if the date is a valid string with the expected format
        if (typeof date === "string" && date.includes(".")) {
            // Split the date into year and month
            const [year, month] = date.split(".").map(Number);
    
            // Base year to calculate the relative month index
            const yearBase = 2004; // Adjust if needed for your data range
    
            // Calculate the relative month index
            const monthIndex = (year - yearBase) * 12 + month;
    
            // Validate the month index to ensure it's within a valid range
            if (monthIndex >= 1 && monthIndex <= 240) { // Valid range check
                return monthIndex;
            } else {
                console.error("Month index out of range:", monthIndex, "for date:", date);
                return null; // Return null if out of range
            }
        } else {
            console.error("Invalid date format:", date); // Log invalid date format
            return null; // Return null for invalid date
        }
    };

    const getYCoordinate = (country, monthIndex) => {
        const countryData = csvData.find((c) => c.SOVEREIGNT === country);
        if (countryData) {
            return yScale(parseFloat(countryData[`month_${monthIndex}`]));
        }
        return yScale(0); // Default if country not found
    };

    var infoBox = d3.select("#info-box");
    if (infoBox.empty()) {
        infoBox = d3.select("body")
            .append("div")
            .attr("id", "info-box")
            .style("position", "absolute")
            .style("right", "0px") // Align to the right edge
            .style("top", "0px") // Align at the top
            .style("height", 80000) // Full screen height
            .style("width", "300px") // Set a fixed width for text wrapping
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "10px")
            .style("overflow-y", "auto") // Enable vertical scrolling
            .style("overflow-wrap", "break-word") // Break long words
            .style("white-space", "normal") // Allow text wrapping
            .style("display", "none"); // Initially hidden
    };
    
    // Function to show the info-box with event data
    const showInfoBox = (d) => {
        const year = d.Date.split('.')[0]; // Extract the year from the event date
        console.log(year)
        const imagePath = `img/World/POI_${d.Country}_${year}.jpg`; // Adjust as needed for your pattern
        const imageHTML = `<img src="${imagePath}" alt="${d.country} event" style="width: 100%; height: auto;" />`;

        infoBox
            .style("display", "block") // Show the info-box
            .style("white-space", "normal") // Allow text wrapping
            .html(`<h3>${d.Country}</h3><p>${d.Date}</p><p>${d.Event}</p><br><br>${imageHTML}`);
    };
    // Plot event dots on the chart
    g.selectAll(".event-dot")
    .data(worldEventData)
    .enter()
    .append("circle")
    .attr("class", "event-dot")
    .attr("cx", (d) => {
        const monthIndex = getMonthIndex(d.Date);
        if (monthIndex !== null) {
            return xScale(monthIndex); // Use correct xScale
        } else {
            return -999; // Default position for invalid index
        }
    })
    .attr("cy", (d) => {
        const monthIndex = getMonthIndex(d.Date);
        if (monthIndex !== null) {
            const yCoord = getYCoordinate(d.Country, monthIndex); // Ensure Y-coordinate is correct
            return yCoord;
        }
        return yScale(0); 
    })
    .attr("r", 6) // Ensure dot is visible
    .attr("fill", "red")
    .style("cursor", "pointer")
    .on("click", (event, d) => {
        // Display event information on the right side
        showInfoBox(d);            
    });
}

function reexpressButtons(csvData){

    var buttonLeft = `${window.innerWidth - 200}px`

    //create and modify button to set map to world comparison expression
    const worldButton = document.createElement('button');
    worldButton.innerText = 'relative to USA';
    worldButton.id = 'worldButton';
    worldButton.class = 'button';
    worldButton.addEventListener("click", function(event, d){
        changeExpression(worldButton, regionButton);
    })
    document.body.appendChild(worldButton);
    worldButton.style.position = 'absolute';
    worldButton.style.top = "20px";
    worldButton.style.left = buttonLeft;

    //create and modify button to set map to regional comparison expression
    const regionButton = document.createElement('button')
    regionButton.innerText = 'relative to local region';
    regionButton.id = 'regionButton';
    regionButton.class = 'button';
    regionButton.addEventListener("click", function(event, d){
        changeExpression(regionButton, worldButton);
    })
    document.body.appendChild(regionButton)
    regionButton.style.position = 'absolute';
    regionButton.style.top = "78px";
    regionButton.style.left = buttonLeft;

    //create function to toggle buttons
    function changeExpression(ONbutton, OFFbutton){
        ONbutton.style.backgroundColor = "#a6a6a6";
        OFFbutton.style.backgroundColor = "#d9d9d9";
        if (ONbutton.id == "worldButton"){
            ONbutton.style.borderTopLeftRadius = "12px";
            ONbutton.style.borderTopRightRadius = "12px";
            OFFbutton.style.borderBottomLeftRadius = "2px";
            OFFbutton.style.borderBottomRightRadius = "2px";
        } else {
            OFFbutton.style.borderTopLeftRadius = "2px";
            OFFbutton.style.borderTopRightRadius = "2px";
            ONbutton.style.borderBottomLeftRadius = "12px";
            ONbutton.style.borderBottomRightRadius = "12px";        };

    }

}

})();
