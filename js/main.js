// MAKE PROGRAM PSEUDOGLOBAL

(function(){
    document.title = "Trends History";

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
    for (let i = 2004; i < 2024; i++) {
        attrArray.push(`max_${i}`);
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
    d3.csv("data/worldMax.csv"),    
    d3.json("data/worldCountry.topojson"), 
    d3.csv("data/regionalMax.csv"),
    d3.json("data/regionalCountry.topojson"), 
    d3.csv("data/World_POI.csv"),
    d3.csv("data/Regional_POI.csv")
    ];
    Promise.all(promises).then(callback);

    function callback(data){               
        worldMapData = data[0],
        worldMapUnits = data[1],
        regionalMapData = data[2],
        regionalMapUnits = data[3],
        worldEventData = data[4],
        regionalEventData = data[5]

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
        setChart(worldMapData, worldEventData);     
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

                } else if (d.properties.SUBREGION == "Northern Africa" ||
                    d.properties.SUBREGION == "Northern America" ||
                    d.properties.SUBREGION == "Southern Africa"){
                    return reds(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Australia and New Zealand" ||
                    d.properties.SUBREGION == "Eastern Africa" ||
                    d.properties.SUBREGION == "Eastern Europe" ||
                    d.properties.SUBREGION == "Central America" ||
                    d.properties.SUBREGION == "Central Asia"){
                    return blues(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Southern Asia" ||
                    d.properties.SUBREGION == "Northern Europe" ||
                    d.properties.SUBREGION == "South America"){
                    return oranges(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Melanesia" ||
                    d.properties.SUBREGION == "Eastern Asia" ||
                    d.properties.SUBREGION == "Western Africa" ||
                    d.properties.SUBREGION == "Southern Europe"){
                    return greens(d.properties[expressed]);

                } else if (d.properties.SUBREGION == "Polynesia" ||
                    d.properties.SUBREGION == "Middle Africa" ||
                    d.properties.SUBREGION == "South-Eastern Asia" ||
                    d.properties.SUBREGION == "Western Europe" ||
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
            mapLabel(d);
            
        })

        .on("mouseout", (event, d) => {
            d3.selectAll(`.country_${d.properties.SUBREGION.replace(/\s+/g, '')}`)

                .style("stroke", function(d){
                    if (d.properties[expressed] > 0){
                        return "none"
                    } else {return "black"}
                })

            .style("stroke-width", 4);

            d3.selectAll(".info").remove()
        })

        .on("click", (event, d) => {
            d3
                .selectAll(`.country_${d.properties.SUBREGION.replace(/\s+/g, '')}`)
                .style("stroke", "yellow")
                .style("stroke-width", "7px")

            d3.selectAll('[class^="country-line"]').attr("stroke-opacity", 0.1);
            d3.selectAll(`[class*=${d.properties.SUBREGION.replace(/\s+/g, '')}]`).attr("stroke-opacity", 1);
        });


    function mapLabel(d){

        const info = d3
            .select("body")
            .append("div")
            .attr("class", "info")
            .style("position", "absolute")
            .style("background", "#f9f9f9")
            .style("border", "1px solid #d3d3d3")
            .style("padding", "5px")
            .style("display", "none");
    
        let val = "";
        if (scope == "world"){
            val = "Global score";
        } else if (scope == "region"){
            val = "Regional score";
        }

        let numb = expressed.replace(/\D/g, "");

        info
            .html(
                `Country: ${d.properties.SOVEREIGNT}<br>Subregion:` + 
                ` ${d.properties.SUBREGION}<br> ${val} in ${numb}: ${d.properties[expressed]}`
                )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .style("display", "block");
                    
    };

};

// COLOR SCALE

function makeColorScale(){
    const interpolation = d3
        .scaleSequential([0,100], d3.interpolatePlasma);
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
            .attr("class", "sideBar")
            .style("height", `${window.innerHeight - 220}px`)
            .style("width", `${window.innerWidth * .22}px`)
    }

    return infoBox;
};

// set information
function showInfoBox(infoBox, eventData) {
    const year = eventData.Date.split('.')[0];

    let imagePath;
    if (scope == "world"){
         imagePath = `img/World/POI_${eventData.Country}_${year}.jpg`;
    } else {
         imagePath = `img/Regional/POI_${eventData.Country}_${year}.jpg`;
    }
     
    const imageHTML = `<img src="${imagePath}"` + 
        `alt="${eventData.Country} event"` +
        `style="width: 100%; height: auto;" />`;

    infoBox
        .style("display", "block")
        .html(
            `<h3>${eventData.Country}</h3><p>${eventData.Date}</p>` + 
            `<p>${eventData.Event}</p><br><br>${imageHTML}`
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
        .attr("r", 5)
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
    d3.select("#chart").remove();
    const chartWidth = window.innerWidth * 0.8;
    const chartHeight = window.innerHeight * 0.4;

    // set margins
    const margin = { top: 20, right: 90, bottom: 20, left: 40 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    // set scales
    const xScale = d3.scaleLinear().domain([1, 20]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

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
    box.style.top = `${window.innerHeight * 0.58}px`;
    box.style.left = "1px";

    // modify margins
    const g = chart
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // create axis
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(20).tickFormat((d) => indexToYear(d)));
    g.append("g")
        .append("text")
        .attr("x", chartWidth*0.905)
        .attr("y", chartHeight*0.9)
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text("Year");
    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", -25)
        .attr("y", -9)
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text("Trend Value (%)");

    // line generator
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
        .style("stroke", function(d){
            if (d.subregion == "Northern Africa" ||
                d.subregion == "Northern America" ||
                d.subregion == "Southern Africa"){
                return "red";

            } else if (d.subregion == "Australia and New Zealand" ||
                d.subregion == "Eastern Africa" ||
                d.subregion == "Eastern Europe" ||
                d.subregion == "Central America" ||
                d.subregion == "Central Asia"){
           return "blue";

            } else if (d.subregion == "Southern Asia" ||
                d.subregion == "Northern Europe" ||
                d.subregion == "South America"){
                    return "orange";

            } else if (d.subregion == "Melanesia" ||
                d.subregion == "Eastern Asia" ||
                d.subregion == "Western Africa" ||
                d.subregion == "Southern Europe"){
                return "green";

            } else if (d.subregion == "Polynesia" ||
                d.subregion == "Middle Africa" ||
                d.subregion == "South-Eastern Asia" ||
                d.subregion == "Western Europe" ||
                d.subregion == "Western Asia"){
                return "purple";

            } else {
                return "black";
            }
        })
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.4)
        .attr("fill", "none");

        //create a text element for the chart title
    const chartTitle = chart
        .append("text")
        .attr("x", chartWidth*0.05)
        .attr("y", 60)
        .attr("class", "chartTitle")
        .text("Every Country's Interest on Google Since 2004");

    // Create tooltip div
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")

    // Add tooltip interaction for lines
    lines
        .on("mouseover", function (event, d) {
            d3
            .select(this)
            .attr("stroke-width", 8)
            .attr("stroke-opacity", 1);

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
                    .style("stroke", function(d){
                        if (d.subregion == "Northern Africa" ||
                            d.subregion == "Northern America" ||
                            d.subregion == "Southern Africa"){
                            return "red";
            
                        } else if (d.subregion == "Australia and New Zealand" ||
                            d.subregion == "Eastern Africa" ||
                            d.subregion == "Eastern Europe" ||
                            d.subregion == "Central America" ||
                            d.subregion == "Central Asia"){
                       return "blue";
            
                        } else if (d.subregion == "Southern Asia" ||
                            d.subregion == "Northern Europe" ||
                            d.subregion == "South America"){
                                return "orange";
            
                        } else if (d.subregion == "Melanesia" ||
                            d.subregion == "Eastern Asia" ||
                            d.subregion == "Western Africa" ||
                            d.subregion == "Southern Europe"){
                            return "green";
            
                        } else if (d.subregion == "Polynesia" ||
                            d.subregion == "Middle Africa" ||
                            d.subregion == "South-Eastern Asia" ||
                            d.subregion == "Western Europe" ||
                            d.subregion == "Western Asia"){
                            return "purple";
            
                        } else {
                            return "black";
                        }
                    })
                    .attr("stroke-width", 2)

                tooltip
                    .style("display", "none");

                lines
                    .attr("stroke-opacity", 0.4);
            });

       const infoBox = initializeInfoBox(); // Initialize the infobox

       createEventDots(g, eventData, xScale, yScale, worldMapData,
           (eventData) => showInfoBox(infoBox, eventData));
};

// TOGGLE BUTTON

function reexpressButtons(){

    //create and modify button to set map to world comparison expression
    const worldButton = document.createElement('button');
    worldButton.innerText = 'relative to USA';
    worldButton.id = 'worldButton';
    worldButton.class = 'button';
    worldButton.addEventListener("click", function(event, d){
        changeExpression(worldButton, regionButton);
        changeChart(worldMapData, worldEventData);
        scope = "world";
    })

    // button position
    const worldButtonPositionVertical = `${window.innerHeight - 180}px`;
    const worldButtonPositionHorizontal = `.12`

    document.body.appendChild(worldButton);
    worldButton.style.position = 'absolute';
    worldButton.style.top = worldButtonPositionVertical;
    worldButton.style.right = `${window.innerWidth * worldButtonPositionHorizontal}px`;

    //create and modify button to set map to regional comparison expression
    const regionButton = document.createElement('button')
    regionButton.innerText = 'relative to local region';
    regionButton.id = 'regionButton';
    regionButton.class = 'button';
    regionButton.addEventListener("click", function(event, d){
        changeExpression(regionButton, worldButton);
        changeChart(regionalMapData, regionalEventData);
        scope = "region";

    })
    document.body.appendChild(regionButton)
    regionButton.style.position = 'absolute';
    regionButton.style.top = worldButtonPositionVertical;
    regionButton.style.right = `${window.innerWidth * worldButtonPositionHorizontal - 100}px`;

    //create function to toggle buttons
    function changeExpression(ONbutton, OFFbutton){

        clearMap();

        ONbutton.style.backgroundColor = "#AFC3D4";
        OFFbutton.style.backgroundColor = "#E0DDCC";

        if (ONbutton.id == "worldButton"){
            ONbutton.style.borderTopLeftRadius = "12px";
            ONbutton.style.borderBottomLeftRadius = "12px";
            OFFbutton.style.borderTopRightRadius = "2px";
            OFFbutton.style.borderBottomRightRadius = "2px";
            setEnumerationUnits(worldCountries, map, path); 
        } else {
            OFFbutton.style.borderTopLeftRadius = "2px";
            OFFbutton.style.borderBottomLeftRadius = "2px";
            ONbutton.style.borderTopRightRadius = "12px";
            ONbutton.style.borderBottomRightRadius = "12px";
            setEnumerationUnits(regionalCountries, map, path); 
        };
    }

    function changeChart(chartData, eventData) {

        // clear the current chart
        d3.select("#chart").remove();

        // recreate the chart with the new data
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
    grays = d3.scaleSequential([0,100], d3.interpolateGreys);

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
    
    //slider control 
    setSlider();
    function setSlider(){
        const slider = d3
        .sliderHorizontal()
        .min(2004)
        .max(2023)
        .step(1)
        .width(window.innerWidth * .18)
        .displayValue(true)
        .tickFormat(d3.format('d'))
        .on('onchange', (val) => {
            d3.select('#value').text(val);
            expressed = attrArray[val-2004];
            updateMapUnits();
        })
        .tickValues([2005, 2010, 2015, 2020]);

        d3.select('#slider')
        .append('svg')
        .attr('width', window.innerWidth * .22)
        .attr('height', 75)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

        let slide = document.getElementById("slider");
        slide.style.position = "absolute";
        slide.style.top = `${window.innerHeight - 100}px`;
        slide.style.left = `${window.innerWidth * .78}px`;
   
    function updateMapUnits(){
        clearMap();
        if (scope == "world"){
            setEnumerationUnits(worldCountries, map, path); 
        } else if (scope == "region"){
            setEnumerationUnits(regionalCountries, map, path); 
        }
    };  
};
}
function createInfoButtonWithModal() {
    // Create the question mark button and position it at the top right corner
    const buttonContainer = d3.select('body')
        .append('div') 
        .attr('id', 'info-button-container')
        .style('position', 'fixed') 
        .style('top', '10px') 
        .style('right', '10px') 
        .style('z-index', '1001');

    const button = buttonContainer.append('button') 
        .attr('id', 'info-button')
        .text('?')
        .style('background-color', '#f1f1f1') 
        .style('border', 'none')
        .style('border-radius', '50%')
        .style('padding', '10px')
        .style('cursor', 'pointer')
        .style('font-size', '16px')
        .style('color', '#333');

    // Create the modal container that covers the whole screen
    const modal = d3.select('body') 
        .append('div')
        .attr('id', 'info-modal') 
        .style('display', 'none') 
        .style('position', 'fixed') 
        .style('top', '0') 
        .style('left', '0') 
        .style('width', '100%') 
        .style('height', '100%') 
        .style('background', 'rgba(0, 0, 0, 0.1)') 
        .style('z-index', '1000') 
        .style('display', 'flex')
        .style('justify-content', 'center') 
        .style('align-items', 'center'); 

    // Create the modal content
    const modalContent = modal.append('div')
        .attr('class', 'modal-content') 
        .style('background', "#E0DDCC")
        .style('padding', '20px')
        .style('border-radius', '5px')
        .style('position', 'relative')
        .style('text-align', 'left');

    modalContent.append('span') // 'X' button to close the modal
        .attr('class', 'close')
        .text('\u00d7') 
        .style('position', 'absolute')
        .style('top', '10px') 
        .style('right', '10px') 
        .style('cursor', 'pointer') 
        .style('font-size', '25px') 
        .style('color', '#333') 
        .on('click', () => {
            modal.style('display', 'none'); 
        });

   
    var info = "<h3><b><u>About the Interface:</u></b></h3>" +
                "<b>Objective: </b>"+
            "This project aims to highlight the discrepancy in interest " +
            "across regions of the world.<br>" +
            "What we hear about is almost always centered on Western, " +
            "especially American, interests.<br>" +
            "Inherently, this shapes how we choose to distribute attention and support around the world.<br><br>" +
            "Our map is a <b>proportional cartogram and choropleth</b> reflecting global interest in different <br>" +
            "countries based on existing <b>Google Trends data</b> since 2004. Since the data is relative, we <br>" +
            "have distinguished interest relative to the US peak, setting <b>November 2020</b> as <b>100%</b> interest, <br>" + 
            "versus relative to most <i>Googled</i> country in that part of the world.<br><br>" + 
            "<strong>(Click on a country to see its region, or click on highlighted point in the <br>" +
            "graph to learn more about what may have caused that spike in interest.)</strong><br><br>" +
            "The <b>line graph</b> offers a different visualization of interest, with the line colors varying based on<br>"+
            "the region of the world the country is from.<br><br>" +
            "You are able to <b>sequence</b> over time to show the distribution of global interest during different<br>"+
            "years using the slider. Additionally, you can <b>reexpress</b> the relative peak with the toggle switch."

    modalContent.append('p').html(info).style("font-size","18px").style("color","black").style("font-family", "sans-serif");

    // Event handler for opening the modal
    button.on('click', () => {
        modal.style('display', 'flex'); // Show the modal
    });

    // Event handler to close the modal if user clicks outside the modal content
    modal.on('click', (event) => {
        if (event.target === event.currentTarget) {
            modal.style('display', 'none'); // Hide the modal
        }
    });
}

// Call the function to create the button and modal
createInfoButtonWithModal();
})();
