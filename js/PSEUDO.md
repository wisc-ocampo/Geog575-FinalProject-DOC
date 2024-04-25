# pseudo
## global
**data**
- land.topojson
- land.csv
- world.csv
- regional.csv
- chartWorldMax.csv | yearly max for chart view
- chartRegionalMax.csv | yearly max for chart view

**arrays**
- data set array | currently selected csv; currently viewed csv
- regional array | pulling current region viewed, if applicable
- value array | assigning values to months; may need 1 per data set

**variables**
tiles
- chartWidth
- chartHeight
- mapWidth
- mapHeight
- if separate tiles, POI data width and height

color
- color / [region]Color
- countryColor | for chart
- otherCountry | for chart; neutral color

size
- transform value / function

**functions**
basic svg
- create svg
- draw svg
- append svgs

basic call
- called when data is updated
- push update to all areas (chart & map, etc.)
- call corresponding .csv 

mouseInteraction
- wait for mouseHover / mouseClick
- update current dataview
- push update to drawChart

drawChart
- called when data view is updated
- draw current data view

focusChart
- called when country / region is clicked or hovered
- update data to show currently focused country / region

drawMap
- called when data view is updated
- draw current data viewed

interestRetrieve
- if region / country has interests
- display menu
- clicking menu
- call interestDisplay

interestDisplay
- when called
- if value is valid > update sidebar
- if value is invaled > clear sidebar

