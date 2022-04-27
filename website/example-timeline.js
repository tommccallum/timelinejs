var exampleTimeline = {
    name: "Prehistory",
    // zoom level which will make the timeline zoom in so 
    // the user can see more at a time, but it will show
    // few events based on some level of importance.
    zoom: 0,
    start: "1000AD",
    // how to represent large distances in time
    // how to represent BC vs AD
    // we don't really want equally spaced we want proportional to numbers of events
    // so the more events the more space between them, maybe we can have multiple axis
    // next to each other?
    axisScrollBackgroundShades: "#905030",
    axes: [
        // early solar system birth axis
        {
            start: -5000000000,
            end: -1000000000,
            majorEvery: 500000000,
            minorEvery: 100000000,
            gap: 100
        },
        // early life era
        {
            start: -1000000000,
            end: -10000000,
            majorEvery: 50000000,
            minorEvery: 10000000,
            gap: 100
        },
        {
            start: -10000000,
            end: -2500000,
            majorEvery: 1000000,
            minorEvery: 500000,
            gap: 100
        },
        // early man era (Paleolithic)
        {
            start: -2500000,
            end: -300000,
            majorEvery: 500000,
            minorEvery: 200000,
            gap: 100
        },
        {
            start: -300000,
            end: -36000,
            majorEvery: 30000,
            minorEvery: 10000,
            gap: 100
        },
        {
            start: -36000,
            end: -3300,
            majorEvery: 6000,
            minorEvery: 3000,
            gap: 200
        },
        {
            start: -3300,
            end: -1200,
            majorEvery: 300,
            minorEvery: 100,
            gap: 100
        },
        {
            start: -1200,
            end: 500,
            majorEvery: 200,
            minorEvery: 10,
            gap: 100
        },
        {
            start: 500,
            end: 1500,
            majorEvery: 100,
            minorEvery: 20,
            gap: 100
        },
        {
            start: 1500,
            end: 2100,
            majorEvery: 100,
            minorEvery: 10,
            gap: 100
        }
    ],
    timebands: [
        {
            index: 0,
            name: "Early Solar System",
            style: "title",
            backgroundColor: '#000000',
            image: null,
            axis: "prehistory",
            description: "Early Solar System",
            events: [
                {
                    name: "Birth of Sun",
                    start: "4500000000BC",
                    style: "default",
                    image: "images/the_sun_64x64.png",
                    imageCredit: "ESA & NASA/Solar Orbiter/EUI team; Data processing: E. Kraaikamp (ROB)",
                    imageCreditLink: "https://www.esa.int/Science_Exploration/Space_Science/Solar_Orbiter/Zooming_into_the_Sun_with_Solar_Orbiter",
                    imageBackgroundColor: "#000000"
                },
                {
                    name: "Prehistory",
                    style: "title",
                    start: "2500000BC",
                    end: "3301BC"
                },
                {
                    name: "History",
                    style: "title",
                    start: "3300BC",
                    end: "2022AD"
                }
            ]
        },
        {
            index: 1,
            name: "Ages",
            style: "title",
            backgroundColor: '#222222',
            image: null,
            events: [
                {
                    name: "Stone Age",
                    start: "2500000BC",
                    end: "3301BC",
                    style: "title"
                },
                {
                    name: "Ancient History",
                    start: "3300BC",
                    end: "499AD",
                    style: "title"
                },
                {
                    name: "Middle Ages",
                    start: "500AD",
                    end: "1499AD",
                    style: "title"
                },
                {
                    name: "Modern History",
                    style: "title",
                    start: "1500AD",
                    end: "today"
                },
            ]
        },
        {
            name: "Band",
            style: "title",
            backgroundColor: '#444444',
            image: null,
            events: [
                {
                    name: "Lower Paleolithic",
                    style: "title",
                    start: "2500000BC",
                    end: "300001BC"
                },
                {
                    // note that the middle paleolithic seems to overlap the upper paleolithic period
                    name: "Middle Paleolithic",
                    style: "title",
                    start: "300000BC",
                    end: "36001BC"
                },
                {
                    name: "Upper Paleolithic",
                    style: "title",
                    start: "36000BC",
                    end: "3301BC"
                },
                {
                    name: "Bronze Age",
                    style: "title",
                    start: "3300BC",
                    end: "1201BC"
                },
                {
                    name: "Iron Age",
                    style: "title",
                    start: "1200BC",
                    end: "500AD"
                }
                // this will be interesting as this is covered by
                // the upper level title.  Do we leave this blank?
            ]
        },
        {
            "name": "Subband",
            backgroundColor: '#999999',
            "events": [
                {
                    name: "Baradostian"
                },
                {
                    name: "Chatelperronian"
                },
                {
                    name: "Aurignacian"
                },
                {
                    name: "Gravettian"
                },
                {
                    name: "Solutrean"
                },
                {
                    name: "Magdalenian"
                },
                {
                    name: "Hamburg"
                },
                {
                    name: "Ahrensberg"
                },
                {
                    name: "Swiderian"
                },
                {
                    name: "Early Bronze Age"
                },
                {
                    name: "Middle Bronze Age"
                },
                {
                    name: "Late Bronze Age"
                },
                {
                    name: "Early Iron Age"
                },
                {
                    name: "Middle Iron Age"
                },
                {
                    name: "Late Iron Age"
                },
            ]
        },
        {
            name: "Hopeman History",
            backgroundColor: '#cccccc',
            style: "dots",
            image: null,
            events: [
                {
                    name: "Village of Hopeman Founded",
                    start: "1805AD",
                    iamge
                }
            ]
        }
    ]
}