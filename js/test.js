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