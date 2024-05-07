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
    box.style.top = `${window.innerHeight * 0.625}px`;
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

    // Calculate x-coordinate
    const getMonthIndex = (date) => {
        if (typeof date === "string" && date.includes(".")) {
            const [year, month] = date.split(".").map(Number);
    
            const yearBase = 2004; // Modify as needed for your data range
            const monthIndex = (year - yearBase) * 12 + month;
    
            if (monthIndex >= 1 && monthIndex <= 240) { // Ensure valid month index
                return monthIndex;
            } else {
                console.error("Month index out of range:", monthIndex, "for date:", date);
                return null;
            }
        } else {
            console.error("Invalid date format:", date);
            return null;
        }
    };

    const getYCoordinate = (country, monthIndex) => {
        const countryData = csvData.find((c) => c.SOVEREIGNT === country);
        if (countryData) {
            return yScale(parseFloat(countryData[`month_${monthIndex}`]));
        }
        return yScale(0); // Default if country not found
    };

    let infoBox = d3.select("#info-box");
    if (infoBox.empty()) {
        infoBox = d3.select("body")
            .append("div")
            .attr("id", "info-box")
            .style("position", "absolute")
            .style("right", "0px") // Align to the right
            .style("top", "0px") // Start from the top
            .style("height", `${window.innerHeight}px`) // Full screen height
            .style("width", "300px") // Adjust width
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "10px")
            .style("overflow-y", "auto") // Allow vertical scrolling
            .style("overflow-wrap", "break-word") // Break long words
            .style("white-space", "normal") // Allow text wrapping
            .style("display", "none"); // Initially hidden
    }
    
    // Function to show the info-box with event data
    const showInfoBox = (d) => {
        const year = d.date.split('.')[0]; // Extract the year from the event date
        const imagePath = `img/World/POI_${d.country}_${year}.jpg`; // Adjust as needed for your pattern
        const imageHTML = `<img src="${imagePath}" alt="${d.country} event" style="width: 100%; height: auto;" />`;

        infoBox
            .style("display", "block") // Show the info-box
            .html(`<h3>${d.country}</h3><p>${d.date}</p><p>${d.description}</p>${imageHTML}`);
    };
    // Plot event dots on the chart
    g.selectAll(".event-dot")
    .data(eventData)
    .enter()
    .append("circle")
    .attr("class", "event-dot")
    .attr("cx", (d) => {
        const monthIndex = getMonthIndex(d.date);
        if (monthIndex !== null) {
            return xScale(monthIndex); // Use correct xScale
        } else {
            return -999; // Default position for invalid index
        }
    })
    .attr("cy", (d) => {
        const monthIndex = getMonthIndex(d.date);
        if (monthIndex !== null) {
            const yCoord = getYCoordinate(d.country, monthIndex); // Ensure Y-coordinate is correct
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

// Data containing event details
const eventData = [
{ country: "Iraq", date: "2004.05", description: "In May 2004, Iraq was facing significant turmoil and violence..." },
{ country: "Vatican", date: "2005.04", description: "In April 2005, a significant event occurred in the Vatican..." },
{ country: "South Africa", date: "2010.06", description: "In June 2010, South Africa hosted the 19th FIFA World Cup..." },
{ country: "Japan", date: "2011.03", description: "On March 11, 2011, Japan was struck by a massive earthquake..." },
{ country: "North Korea", date: "2013.04", description: "In April 2013, North Korea was involved in a significant escalation..." },
{ country: "Ukraine", date: "2014.03", description: "In March 2014, Ukraine faced significant geopolitical turmoil..." },
{ country: "Brazil", date: "2014.06", description: "The 2014 FIFA World Cup took place in Brazil from June 12 to July 13..." },
{ country: "Netherlands", date: "2014.07", description: "In July 2014, the Netherlands faced the tragic downing of Malaysia Airlines Flight MH17..." },
{ country: "Ireland", date: "2016.06", description: "In June 2016, the United Kingdom's Brexit referendum had significant implications for Ireland..." },
{ country: "Turkey", date: "2016.07", description: "On July 15, Turkey experienced a dramatic coup attempt..." },
{ country: "North Korea", date: "2017.04", description: "In April 2017, North Korea continued its pattern of provocative actions..." },
{ country: "North Korea", date: "2017.09", description: "In September 2017, North Korea's continued nuclear and missile tests..." },
{ country: "Spain", date: "2018.05", description: "In May 2018, Spain experienced significant political upheaval..." },
{ country: "Russia", date: "2018.06", description: "In June 2018, Russia hosted the FIFA World Cup..." },
{ country: "Sweden", date: "2018.06", description: "In June 2018, Sweden participated in the FIFA World Cup..." },
{ country: "Croatia", date: "2018.07", description: "In July 2018, Croatia made headlines due to its remarkable performance..." },
{ country: "Italy", date: "2020.03", description: "In March 2020, Italy experienced a significant and challenging period due to the COVID-19 pandemic..." },
{ country: "Lebanon", date: "2020.08", description: "In August 2020, Lebanon experienced a devastating port explosion in Beirut..." },
{ country: "Russia", date: "2022.02", description: "In February 2022, Russia's actions toward Ukraine marked a significant escalation..." },
{ country: "Ukraine", date: "2022.02", description: "In February 2022, Ukraine faced dramatic escalation due to Russia's full-scale invasion..." },
{ country: "Qatar", date: "2022.11", description: "In November 2022, Qatar gained significant international attention for hosting the FIFA World Cup..." },
{ country: "Saudi Arabia", date: "2022.11", description: "In November 2022, Saudi Arabia's national football team made headlines by defeating Argentina..." },
{ country: "Argentina", date: "2022.12", description: "In December 2022, Argentina experienced significant national attention due to the FIFA World Cup..." },
{ country: "Morocco", date: "2022.12", description: "In December 2022, Morocco achieved historic success at the FIFA World Cup..." },
{ country: "Turkey", date: "2023.02", description: "In February 2023, Turkey experienced devastating earthquakes..." },
{ country: "Israel-Palestine", date: "2023.01", description: "In January 2023, the Israel-Palestine conflict saw a surge in violence..." },
];


function reexpressButtons(csvData){

    var buttonLeft = `${window.innerWidth * .875}px`

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
    regionButton.style.top = "60px";
    regionButton.style.left = buttonLeft;

    //create function to toggle buttons
    function changeExpression(ONbutton, OFFbutton){
        ONbutton.innerText = "test";
        OFFbutton.innerText = OFFbutton.id;
    }

}

})();
