const transformObject = (inputObj) => {
    // Iterate over the object keys and values
    const transformedObj = Object.fromEntries(
        Object.entries(inputObj).map(([key, array1]) => {
            // Process array1: Iterate over each array2
            const transformedArray1 = array1.map(array2 => {
                // Replace array3 (the only value in array2) with an object { x, y }
                return array2[0].map(array3 => {
                    const [firstValue, secondValue] = array3;
                    return { x: firstValue, y: secondValue };
                });
            });

            // Return the transformed key-value pair
            return [key, transformedArray1];
        })
    );

    return transformedObj;
};




coordinates = {"Canada": canada.features.map(feature  => feature.geometry.coordinates),
               "Japan": japan.features.map(feature  => feature.geometry.coordinates),
               "NorthKorea": north_korea.features.map(feature  => feature.geometry.coordinates),
               "Russia": russia.features.map(feature  => feature.geometry.coordinates),
               "SouthKorea": south_korea.features.map(feature  => feature.geometry.coordinates),
               "USA": usa.features.map(feature  => feature.geometry.coordinates),
               "China": china.features.map(feature  => feature.geometry.coordinates)};
coordinates = transformObject(coordinates);
