function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
coordinates = {"Canada": canada.features.map(feature  => feature.geometry.coordinates),
               "Japan": japan.features.map(feature  => feature.geometry.coordinates),
               "NorthKorea": north_korea.features.map(feature  => feature.geometry.coordinates),
               "Russia": russia.features.map(feature  => feature.geometry.coordinates),
               "SouthKorea": south_korea.features.map(feature  => feature.geometry.coordinates),
               "USA": usa.features.map(feature  => feature.geometry.coordinates)};

