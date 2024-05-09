// MAKE PROGRAM PSEUDOGLOBAL

(function(){

// PSEUODOGLOBAL VARIABLES
    
    // define subregions (for color)
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

    // set months for map re-expression
    const attrArray = [];
    for (let i = 1; i < 245; i++) {
        attrArray.push(`month_${i}`);
    }

    // create map projection
    let projection;
        worldCountries = "",
        regionalCountries = "",
        path = "",
        map = "",
        worldMapData = "",
        regionalMapData = "",
        regionalEventData = "",
        worldChartMax = "",
        regionalChartMax = "";
        reds = "",
        blues = "",
        greens = "",
        oranges = "",
        purples = "",
        grays = "",
        scope = "world";

        // sets starting attribute
        expressed = attrArray[0]; 

    window.onload = setMap();

// MAP
function setMap(){

    const width = window.innerWidth * .75,
        height = window.innerHeight * .7;

    // create map SVG
    map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map");

        const box = document
        .getElementById(`map`);
        box.style.position = 'absolute';
        box.style.top = 1;
        box.style.left = 1;


    // set equal area projection
    projection = d3
        .geoEqualEarth()
        .center([0, 0])
        .rotate([-10, 0, 0])
        .scale(window.innerWidth / 7.5)
        .translate([width / 2, height / 2]);
    
    path = d3
        .geoPath()
        .projection(projection);

// DATA

    const promises = [    
    d3.csv("data/world.csv"),    
    d3.json("data/worldCountry.topojson"), 
    d3.csv("data/regional.csv"),
    d3.json("data/regionalCountry.topojson"), 
    d3.csv("data/World_POI.csv"),
    d3.csv("data/Regional_POI.csv"),
    d3.csv("data/worldMax.csv"),
    d3.csv("data/regionalMax.csv")
    ];
    Promise.all(promises).then(callback);

    function callback(data){               
        worldMapData = data[0],
        worldMapUnits = data[1],
        regionalMapData = data[2],
        regionalMapUnits = data[3],
        worldEventData = data[4],
        regionalEventData = data[5],
        worldChartMax =data[6],
        regionalChartMax = data[7]

        const baseCountries = topojson
                .feature(worldMapUnits, worldMapUnits.objects.worldCountry);
            worldCountries = topojson
                .feature(worldMapUnits, worldMapUnits.objects.worldCountry)
                .features;
            regionalCountries = topojson
                .feature(regionalMapUnits, regionalMapUnits.objects.regionalCountry)
                .features;

// MAP

        setGraticule (map, path);

        const base = map
            .append("path")
            .datum(baseCountries)
            .attr("class", "baseCountries")
            .attr("d", path);

// DATA

    // join .csvs to .topojson
        worldCountries = joinData(worldCountries, worldMapData);
        regionalCountries = joinData(regionalCountries, regionalMapData);

// MAP

        world_colorScale = makeColorScale(worldMapData);
        setEnumerationUnits(worldCountries, map, path, world_colorScale); 
        setChart(worldChartMax, worldEventData);     
        reexpressButtons();
        makeRegionColorscales();
        setSequenceControls();
    };
};

// DATA

    // join data
function joinData(UsedCountries, csv){

    // loop through .csv attributes to join all to .topojson
    for (let i=0; i<csv.length; i++){
        const csvCountry = csv[i];
            csvKey = csvCountry.SOVEREIGNT;

        // loop through .csv regions
        for (let a=0; a<UsedCountries.length; a++){

            // sets country with region
            const geojsonProps = UsedCountries[a].properties;

            // sets geojson primary key
            const geojsonKey = geojsonProps.SOVEREIGNT;

            // if match, attach data to .topojson
            if (geojsonKey == csvKey){

                attrArray.forEach(function(attr){
                    const val = parseFloat(csvCountry[attr]); 
                    geojsonProps[attr] = val;
                });
            };
        };
    };
    return UsedCountries;
};

// CHOROPLETH MAP

function setEnumerationUnits(countriesToUse, map, path){

    // set scale by data
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
    const worldMapUnits = map
        .selectAll(".worldMapUnits")
        .data(countriesToUse)
        .enter()
        .append("path")
        .attr("id", function(d){
            return `country_${d.properties.SOVEREIGNT.replace(/\s+/g, '')}`;
        })
        .attr("class", function(d){
            return `country_${d.properties.SUBREGION.replace(/\s+/g, '')}`;        
        })
        .attr("d", path)
        .style("fill", function(d){

            if (d.properties[expressed] > 0){

                if (countriesToUse == worldCountries){
                    return world_colorScale(d.properties[expressed])

                } else if (d.properties.SUBREGION == "Eastern Asia" ||
                    d.properties.SUBREGION == "Central America" ||
                    d.properties.SUBREGION == "Middle Africa"){
                    return reds(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Australia and New Zealand" ||
                    d.properties.SUBREGION == "Eastern Africa" ||
                    d.properties.SUBREGION == "Eastern Europe" ||
                    d.properties.SUBREGION == "Central Asia"){
                    return blues(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "South-Eastern Asia" ||
                        d.properties.SUBREGION == "Northern Europe" ||
                        d.properties.SUBREGION == "South America"){
                    return oranges(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Melanesia" ||
                        d.properties.SUBREGION == "Western Africa" ||
                        d.properties.SUBREGION == "Southern Europe"){
                    return greens(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Polynesia" ||
                        d.properties.SUBREGION == "Southern Asia" ||
                        d.properties.SUBREGION == "Western Asia"){
                    return purples(d.properties[expressed]);

                } else {
                    return grays(d.properties[expressed]);
                }

            } else {return "#676767"}
        })

        .style("stroke-width", 4)

        .style("stroke", function(d){
            if (d.properties[expressed] > 0){
                return "none"
            } else {return "black"}
        })

        .attr("transform", d => transform(d, expressed))

        .on("mouseover", (event, d) => {
            d3.selectAll(`#country_${d.properties.SOVEREIGNT.replace(/\s+/g, '')}`)
            .style("stroke-width", 4).style("stroke", "yellow");
        })

        .on("mouseout", (event, d) => {
            d3.selectAll(`.country_${d.properties.SUBREGION.replace(/\s+/g, '')}`)

                .style("stroke", function(d){
                    if (d.properties[expressed] > 0){
                        return "none"
                    } else {return "black"}
                })

            .style("stroke-width", 4);
        })

        .on("click", (event, d) => {
            d3
                .selectAll(`.country_${d.properties.SUBREGION.replace(/\s+/g, '')}`)
                .style("stroke", "yellow")
                .style("stroke-width", "10px")

            d3.selectAll('[class^="country-line"]').attr("stroke-opacity", 0.1);
            d3.selectAll(`[class*=${d.properties.SUBREGION.replace(/\s+/g, '')}]`).attr("stroke-opacity", 1);
        });
};

// COLOR SCALE

function makeColorScale(){
    const interpolation = d3
        .scaleSequential([0,100], d3.interpolateReds);
    return interpolation
};

// GRATICULE

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

// POI SIDEBAR

// create
function initializeInfoBox() {
    let infoBox = d3.select("#info-box");
    
    if (infoBox.empty()) {
        infoBox = d3
            .select("body")
            .append("div")
            .attr("id", "info-box")
            .style("position", "absolute")
            .style("right", "0px")
            .style("top", "0px")
            .style("height", `${window.innerHeight}px`)

            // set width for text wrap
            .style("width", "300px")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "10px")

            // vertical scroll
            .style("overflow-y", "auto")
            .style("display", "none");
    }

    return infoBox;
};

// set information
function showInfoBox(infoBox, eventData) {
    const year = eventData.Date.split('.')[0];

    // find image
    const imagePath = `img/World/POI_${eventData.Country}_${year}.jpg`; 
    const imageHTML = `<img src="${imagePath}"` + 
        `alt="${eventData.Country} event"` + 
        `style="width: 100%; height: auto;" />`;

    infoBox
        .style("display", "block")
        .html(
            `<h3>${eventData.Country}</h3><p>${eventData.Date}</p><p>${eventData.Event}</p><br><br>${imageHTML}`
        );
};

// create event dots; event interactions
function createEventDots(selection, eventData, xScale, yScale, worldMapData, showInfoBox) {
    const getYear = (date) => {

    // convert year to integer; set valid years
        if (typeof date === "string" && date.includes(".")) {
            const [yearStr, monthStr] = date.split(".");
            const year = parseInt(yearStr, 10);

            if (year >= 2004 && year <= 2023) {
                return year;
            }
        }

        return null;
    };

    const getYCoordinate = (country, year) => {
        const countryData = worldMapData.find((c) => c.SOVEREIGNT === country);

        if (countryData) {
            const dataKey = `max_${year}`; // Build the data key
            const value = parseFloat(countryData[dataKey]); // Get the trend value
            return yScale(value); // Return scaled Y-coordinate
        }
        return yScale(0); // Default if data not found
    };

    selection
        .selectAll(".event-dot")
        .data(eventData)
        .enter()
        .append("circle")
        .attr("class", "event-dot")
        .attr("cx", (d) => {
            const year = getYear(d.Date); // Get the year from the date
            if (year !== null) {
                const yearIndex = year - 2004 + 1; // Convert year to index (1-based)
                return xScale(yearIndex); // Return the scaled X-coordinate
            }
            return -999; // Default position
        })
        .attr("cy", (d) => {
            const year = getYear(d.Date); // Get the year from the date
            if (year !== null) {
                return getYCoordinate(d.Country, year); // Get the Y-coordinate
            }
            return yScale(0); // Default if invalid
        })
        .attr("r", 6)
        .attr("fill", "red")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            showInfoBox(d); // Show the infobox on click
        });
}

// SET YEAR FOR CHART

function indexToYear(index) {

    // set starting year; total years
    const yearBase = 2004;
    const totalYears = 21;

    // calculate current year; increase year
    if (index >= 1 && index <= totalYears) {
        const year = yearBase + (index - 1);

        // e.g., 2004 -> 2005 -> 2006
        return `${year}`;
    }
    
    // return empty year after all other years
    return "";
};

// CHART
function setChart(worldMapData, eventData) {
    const chartWidth = window.innerWidth * 0.8;
    const chartHeight = window.innerHeight * 0.4;

    // Margin for axis
    const margin = { top: 20, right: 90, bottom: 20, left: 40 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    // Scales for x and y axes
    const xScale = d3.scaleLinear().domain([1, 21]).range([0, width]); // Adjust domain if needed
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]); // Adjust domain if needed

    const regionColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(
        worldMapData.map((d) => d.subregion)
    );

    // create chart
    const chart = d3
        .select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart")
        .attr("id", "chart");

    const box = document.getElementById("chart");
    box.style.position = "absolute";
    box.style.top = `${window.innerHeight * 0.6}px`;
    box.style.left = "1px";

    // Append a group for margin handling
    const g = chart
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X and Y axes
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(20).tickFormat((d) => indexToYear(d)));
    g.append("g")
        .append("text")
        .attr("x", chartWidth*0.9)
        .attr("y", chartHeight*0.9)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Years");
    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", -25)
        .attr("y", -9)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text("Trend Value (%)");

    // Line generator
    const line = d3.line().x((d, i) => xScale(i + 1)).y((d) => yScale(d));
    
    // Plot lines for each country
    const lines = g
        .selectAll(".country-line")
        .data(worldMapData)
        .enter()
        .append("path")
        .attr("class", (d) => `country-line${d.subregion.replace(/\s+/g, '')}`)
        
        .attr("d", (d) => {
            const values = Object.keys(d)
                .filter((key) => key.startsWith("max_"))
                .map((key) => parseFloat(d[key]));
            return line(values);
        })

        .attr("stroke", (d) => regionColorScale(d.subregion))
        .attr("stroke-width", 2)
        .attr("fill", "none");

        //create a text element for the chart title
    const chartTitle = chart
        .append("text")
        .attr("x", chartWidth*0.2)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text(
        "Google trends values for all countries (coloured based on regions) relative to USA");

    // Create tooltip div
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#f9f9f9")
        .style("border", "1px solid #d3d3d3")
        .style("padding", "5px")
        .style("display", "none");


    // Add tooltip interaction for lines
    lines
        .on("mouseover", function (event, d) {
            d3
            .select(this)
            .attr("stroke", "yellow")
            .attr("stroke-width", 4);

            const mouseX = d3
                .pointer(event, g.node())[0];
            const yearIndex = Math
                .round(xScale.invert(mouseX)); // Get index from xScale
            const year = indexToYear(yearIndex); // Convert index to year
            const yearValue = d[`max_${year}`] || "No data";

            tooltip

                // display year, not month
                .html(
                    `Country: ${d.SOVEREIGNT}<br>Subregion:` + 
                    ` ${d.subregion}<br>Year: ${year}`
                    )
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .style("display", "block");

            // Fade other lines
            lines
                .filter((other) => other !== d).attr("stroke-opacity", 0.1);
        })
                .on("mouseout", function (event, d) {
            
                    d3
                    .select(this)
                    .attr("stroke", (d) => regionColorScale(d.subregion))
                    .attr("stroke-width", 2);

                tooltip
                    .style("display", "none");

                lines
                    .attr("stroke-opacity", 1);
            });
       // console.log("!!!!!!!!!!!!")

       const infoBox = initializeInfoBox(); // Initialize the infobox

       createEventDots(g, eventData, xScale, yScale, worldMapData,
           (eventData) => showInfoBox(infoBox, eventData));
};

// TOGGLE BUTTON

function reexpressButtons(){
    const buttonLeft = `${window.innerWidth - 200}px`

    //create and modify button to set map to world comparison expression
    const worldButton = document.createElement('button');
    worldButton.innerText = 'relative to USA';
    worldButton.id = 'worldButton';
    worldButton.class = 'button';
    worldButton.addEventListener("click", function(event, d){
        changeExpression(worldButton, regionButton);
        changeChart(worldChartMax, worldEventData);
        scope = "world";
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
        changeChart(regionalChartMax, regionalEventData);
        scope = "region";

    })
    document.body.appendChild(regionButton)
    regionButton.style.position = 'absolute';
    regionButton.style.top = "78px";
    regionButton.style.left = buttonLeft;

    //create function to toggle buttons
    function changeExpression(ONbutton, OFFbutton){

        clearMap();

        ONbutton.style.backgroundColor = "#a6a6a6";
        OFFbutton.style.backgroundColor = "#d9d9d9";

        if (ONbutton.id == "worldButton"){
            ONbutton.style.borderTopLeftRadius = "12px";
            ONbutton.style.borderTopRightRadius = "12px";
            OFFbutton.style.borderBottomLeftRadius = "2px";
            OFFbutton.style.borderBottomRightRadius = "2px";
            setEnumerationUnits(worldCountries, map, path); 
        } else {
            OFFbutton.style.borderTopLeftRadius = "2px";
            OFFbutton.style.borderTopRightRadius = "2px";
            ONbutton.style.borderBottomLeftRadius = "12px";
            ONbutton.style.borderBottomRightRadius = "12px";
            setEnumerationUnits(regionalCountries, map, path); 
        };
    }

    function changeChart(chartData, eventData) {

        // Clear the current chart
        d3.select("#chart").remove();

        // Recreate the chart with the new data
        setChart(chartData, eventData);
    }
};

// REGION COLOR SCALES
function makeRegionColorscales() {
    reds = d3.scaleSequential([0,100], d3.interpolateReds);
    blues = d3.scaleSequential([0,100], d3.interpolateBlues);
    oranges = d3.scaleSequential([0,100], d3.interpolateOranges);
    purples = d3.scaleSequential([0,100], d3.interpolatePurples);
    greens = d3.scaleSequential([0,100], d3.interpolateGreens);
    grays = d3.scaleSequential([0,100], (d3.interpolate("white", "black")))

};

// CLEAR MAP
function clearMap(){
    const elements = document.querySelectorAll('[class^="country_"]');
    elements.forEach(function(element) {
      element.remove();
    });
}

//SEQUENCE CONTROLS

function setSequenceControls(){
    var slider = d3
        .sliderHorizontal()
        .min(1)
        .max(240)
        .step(1)
        .width(300)
        .displayValue(true)
        .on('onchange', (val) => {
            d3.select('#value').text(val);
            updateMapUnits(val);
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', 350)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider)
        .attr();

    const slide = document.getElementById("slider");
    slide.style.position = "absolute";
    slide.style.top = `${window.innerHeight * 0.85}px`;
    slide.style.left = `${window.innerWidth -350}px`;
};

function updateMapUnits(n){
    expressed = attrArray[n-1];
    clearMap();
    if (scope == "world"){
        setEnumerationUnits(worldCountries, map, path); 
    } else if (scope == "region"){
        setEnumerationUnits(regionalCountries, map, path); 
    }
};    

})();
