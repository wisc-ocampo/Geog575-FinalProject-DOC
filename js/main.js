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
    var width = window.innerWidth * .975,
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
        .center([0, 8])
        .rotate([3, 0, 0])
        .parallels([0, 0])
        .scale(270)
        .translate([width / 2, height / 2]);
        
    var path = d3.geoPath()
        .projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/world.csv")); //load attributes from csv    
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
        setEnumerationUnits(worldCountries, map, path, colorScale, csvData);

        
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
    
    function transform(d, expressed) {
        const [x, y] = path.centroid(d);
        if (d.properties[expressed] >= 0){
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
            if (d.properties[expressed] >= 0){
                return colorScale(d.properties[expressed])
            } else {
                return "black"
            }
        })
        .attr("transform", d => transform(d, expressed));
};

//function to create color scale generator
function makeColorScale(data){

    const interpolation = d3
        .scaleSequential([0,100], d3.interpolateBlues);
    return interpolation
};

})();
