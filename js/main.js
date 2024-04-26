//insert code here!
(function(){

    //pseudo-global variables
    var attrArray = []; //list of months
    for (let i = 1; i < 245; i++) {
        attrArray.push(`month_${i}`);
    }

    var expressed = attrArray[0]; //initial attribute

    //begin script when window loads
    window.onload = setMap();

//set up choropleth map
function setMap(){
    //map frame dimensions
    var width = window.innerWidth * .8,
        height = window.innerHeight * .6;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
//need to change projection***
    var projection = d3.geoAlbers()
        .center([0, 0])
        .rotate([0, 0, 0])
        .parallels([0, 0])
        .scale(200)
        .translate([width / 2, height / 2]);
        
    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/initial_countryGoogleTrends.csv")); //load attributes from csv    
    promises.push(d3.json("data/initial_countries.topojson")); //load spatial data    
    Promise.all(promises).then(callback);

    function callback(data){               
        var csvData = data[0], countries = data[1];

        //translate country TopoJSONs
        var worldCountries = topojson.feature(countries, countries.objects.ne_50m_admin_0_countries_lakes).features;

        //join csv data to GeoJSON enumeration units
        worldCountries = joinData(worldCountries, csvData);

        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(worldCountries, map, path, colorScale);

        
    };
}; //end of setMap()

function joinData(worldCountries, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvCountry = csvData[i]; //the current region
        var csvKey = csvCountry.NAME; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){

            var geojsonProps = worldCountries[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.NAME; //the geojson primary key

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

function setEnumerationUnits(worldCountries, map, path, colorScale){

    //add France regions to map
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
            return colorScale(d.properties[expressed]);
        });
};

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //assign array of expressed values as scale domain
    colorScale.domain(domainArray);

    return colorScale;
};





})();
