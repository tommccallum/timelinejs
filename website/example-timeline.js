var exampleTimeline = {
    name: "Prehistory",
    // zoom level which will make the timeline zoom in so 
    // the user can see more at a time, but it will show
    // few events based on some level of importance.
    zoom: 0,
    start: "1800AD",
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
            gap: 200
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
            minorEvery: 50,
            gap: 100
        },
        {
            name: "Middle Ages",
            start: 500,
            end: 1500,
            majorEvery: 100,
            minorEvery: 20,
            gap: 100
        },
        {
            name: "Modern Era",
            start: 1500,
            end: 2100,
            majorEvery: 100,
            minorEvery: 10,
            gap: 100,
            showEnd: true
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
            name: "Scottish Kings",
            backgroundColor: 'transparent',
            visible: true,
            events: [
                {
                    name: "House of Alpin",
                    style: "default",
                    start: "848AD",
                    end: "1034AD",
                    historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)",
                    children: [
                        {
                            name: "Kenneth I MacAlpin",
                            description: "The start of Kenneth's reign is placed 843 or 848AD.",
                            style: "default",
                            start: "843AD",
                            end: "858AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Donald I MacAlpin",
                            style: "default",
                            start: "858AD",
                            end: "862AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Constantine I MacAlpin",
                            style: "default",
                            start: "862AD",
                            end: "877AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "&#193;ed I MacAlpin",
                            style: "default",
                            start: "877AD",
                            end: "878AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Giric",
                            style: "default",
                            start: "878AD",
                            end: "889AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Eochaid",
                            style: "default",
                            start: "878AD",
                            end: "889AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Donald II",
                            style: "default",
                            start: "889AD",
                            end: "900AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Constantine II",
                            style: "default",
                            start: "900AD",
                            end: "943AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Malcolm I",
                            style: "default",
                            start: "943AD",
                            end: "954AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        // here
                        {
                            name: "Indulf",
                            style: "default",
                            start: "954AD",
                            end: "962AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Dub",
                            style: "default",
                            start: "962AD",
                            end: "967AD",
                            description: "Also known as Dubh or Duff.",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Cuilén",
                            style: "default",
                            start: "967AD",
                            end: "971AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Amlaíb",
                            style: "default",
                            start: "973AD",
                            end: "977AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Kenneth II",
                            style: "default",
                            start: "971AD",
                            end: "995AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Constantine III",
                            style: "default",
                            start: "995AD",
                            end: "997AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Kenneth III",
                            style: "default",
                            start: "997AD",
                            end: "1005AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        },
                        {
                            name: "Malcolm II",
                            style: "default",
                            start: "1005AD",
                            end: "1034AD",
                            historyCreditLink: "https://en.wikipedia.org/wiki/List_of_Scottish_monarchs#House_of_Alpin_(848%E2%80%931034)"
                        }
                    ]
                },
                {
                    name: "House of Dunkeld",
                    style: "default",
                    start: "1034AD",
                    end: "1286AD"
                },
                {
                    name: "House of Sverre",
                    style: "default",
                    start: "1286AD",
                    end: "1290AD"
                },
                {
                    name: "First Interregnum",
                    style: "default",
                    start: "1290AD",
                    end: "1292AD"
                },
                {
                    name: "House of Balliol",
                    style: "default",
                    start: "1292AD",
                    end: "1296AD"
                },
                {
                    name: "Second Interregnum",
                    style: "default",
                    start: "1296AD",
                    end: "1306AD"
                },
                {
                    name: "House of Bruce",
                    style: "default",
                    start: "13060AD",
                    end: "1371AD"
                },
                {
                    name: "House of Balliol",
                    style: "default",
                    start: "1332AD",
                    end: "1356AD"
                },
                {
                    name: "House of Stewart/Stuart",
                    style: "default",
                    start: "1371AD",
                    end: "1651AD"
                },
                {
                    name: "Third Interregnum",
                    style: "default",
                    start: "1651AD",
                    end: "1660AD"
                },
                {
                    name: "House of Stuart",
                    style: "default",
                    start: "1660AD",
                    end: "1707AD"
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
                    name: "Lands owned by Lord Duffus",
                    start: "1300AD",
                    end: "1704",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline",
                    gallery: [
                        {
                            image: "images/Hopeman_Sandstone_-_geograph.org.uk_-_2602068.jpg",
                            imageCredit: "Hopeman Sandstone by Anne Burgess, CC BY-SA 2.0 <https://creativecommons.org/licenses/by-sa/2.0>, via Wikimedia Commons",
                            imageCreditLink: "https://commons.wikimedia.org/wiki/File:Hopeman_Sandstone_-_geograph.org.uk_-_2602068.jpg",
                            alt: "Hopeman Sandstone"
                        },
                        {
                            image: "images/800px-Hopeman_18_06_19_railway_station.jpg",
                            thumbnail: "images/Hopeman_railway_station_128x96.png",
                            imageCredit: "Jan Grabarek, CC BY-SA 4.0 <https://creativecommons.org/licenses/by-sa/4.0>, via Wikimedia Commons",
                            imageCreditLink: "https://commons.wikimedia.org/wiki/File:Hopeman_18_06_19.jpg"
                        }
                    ]
                },
                {
                    name: "Inverugie estates purchased by Sir Archibald Dunbar of Thunderton",
                    start: "1705AD",
                    end: "1797AD",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline",
                    gallery: [
                        {
                            image: "images/Hopeman_Sandstone_-_geograph.org.uk_-_2602068.jpg",
                            imageCredit: "Hopeman Sandstone by Anne Burgess, CC BY-SA 2.0 <https://creativecommons.org/licenses/by-sa/2.0>, via Wikimedia Commons",
                            imageCreditLink: "https://commons.wikimedia.org/wiki/File:Hopeman_Sandstone_-_geograph.org.uk_-_2602068.jpg"
                        },
                        {
                            image: "images/800px-Hopeman_18_06_19_railway_station.jpg",
                            thumbnail: "images/Hopeman_railway_station_128x96.png",
                            imageCredit: "Jan Grabarek, CC BY-SA 4.0 <https://creativecommons.org/licenses/by-sa/4.0>, via Wikimedia Commons",
                            imageCreditLink: "https://commons.wikimedia.org/wiki/File:Hopeman_18_06_19.jpg"
                        }
                    ],
                    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vulputate tellus vel elit lobortis convallis. Sed arcu ante, malesuada faucibus lectus vel, gravida posuere ipsum. Vivamus et faucibus ligula, eget ullamcorper nunc. Aliquam erat volutpat. Donec eget congue metus. Proin ultricies odio sed leo feugiat venenatis. Phasellus in vulputate metus. Sed pellentesque pulvinar sodales. Curabitur sagittis aliquet faucibus. Curabitur faucibus nunc metus, a cursus elit ullamcorper nec. Morbi sit amet sagittis turpis, eget accumsan est. Praesent elit tellus, porta non odio euismod, dictum lobortis metus. Curabitur non sem vehicula, facilisis augue at, blandit erat. Praesent molestie tellus velit, in tristique nisi faucibus id.\n\n\
                    Aliquam hendrerit bibendum orci vel convallis. Nunc vulputate ultricies posuere. Nulla fermentum ligula vitae libero porttitor mattis. Etiam id posuere magna. Pellentesque tincidunt finibus tellus at ornare. Phasellus luctus urna ligula, a vehicula nulla imperdiet in. Etiam facilisis, nibh eu imperdiet dignissim, turpis diam congue dolor, nec ultrices odio felis at leo. Integer vehicula lectus eu odio vulputate feugiat. Vestibulum ut pretium mi. Sed sed neque eu erat vestibulum ultrices. In hac habitasse platea dictumst. Integer eget sapien nec felis vulputate semper. Cras porttitor viverra accumsan."
                },
                {
                    name: "Inverugue estate purchased by Mr Young of Burghead",
                    start: "1803AD",
                    end: "1804AD",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline",
                    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vulputate tellus vel elit lobortis convallis. Sed arcu ante, malesuada faucibus lectus vel, gravida posuere ipsum. Vivamus et faucibus ligula, eget ullamcorper nunc. Aliquam erat volutpat. Donec eget congue metus. Proin ultricies odio sed leo feugiat venenatis. Phasellus in vulputate metus. Sed pellentesque pulvinar sodales. Curabitur sagittis aliquet faucibus. Curabitur faucibus nunc metus, a cursus elit ullamcorper nec. Morbi sit amet sagittis turpis, eget accumsan est. Praesent elit tellus, porta non odio euismod, dictum lobortis metus. Curabitur non sem vehicula, facilisis augue at, blandit erat. Praesent molestie tellus velit, in tristique nisi faucibus id.\n\n\
                    Aliquam hendrerit bibendum orci vel convallis. Nunc vulputate ultricies posuere. Nulla fermentum ligula vitae libero porttitor mattis. Etiam id posuere magna. Pellentesque tincidunt finibus tellus at ornare. Phasellus luctus urna ligula, a vehicula nulla imperdiet in. Etiam facilisis, nibh eu imperdiet dignissim, turpis diam congue dolor, nec ultrices odio felis at leo. Integer vehicula lectus eu odio vulputate feugiat. Vestibulum ut pretium mi. Sed sed neque eu erat vestibulum ultrices. In hac habitasse platea dictumst. Integer eget sapien nec felis vulputate semper. Cras porttitor viverra accumsan.\n\n\
                    Donec iaculis dapibus mi vitae feugiat. Fusce ac leo eget magna auctor bibendum. Pellentesque gravida tincidunt dictum. Donec pulvinar libero at lacus laoreet dignissim. Vestibulum pulvinar sagittis felis vitae mollis. Fusce accumsan id ligula eget aliquet. Curabitur non feugiat turpis.\n\n\
                    Pellentesque molestie justo quis dapibus ultricies. Curabitur id faucibus nisi. Etiam finibus neque sagittis, placerat mauris vitae, maximus sapien. Nulla sapien arcu, cursus et dui sed, hendrerit hendrerit sem. Aenean quis neque enim. Sed sed metus eget dolor consequat rutrum at nec massa. In non enim id dui rutrum aliquam. Vestibulum pharetra id odio hendrerit suscipit. Integer at eros sed quam mattis tristique ac non ante. Suspendisse potenti. Duis ornare quis odio at luctus. Nam ut justo dui. Sed vel consectetur arcu, sodales sodales ipsum.\n\n\
                    Sed pellentesque nisl arcu, ac semper dolor euismod vel. Aenean pellentesque interdum orci sit amet molestie. Nulla vestibulum nisi et dictum dictum. Aenean quis felis dui. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas interdum, eros ut sodales pulvinar, metus tellus commodo nunc, at posuere diam nulla non felis. Aenean nec tempor tortor, non dignissim dui.\n\n\
                    Vivamus ultricies erat ac diam viverra eleifend. Praesent sagittis lorem non lacus lacinia, at elementum nunc interdum. Aliquam et venenatis purus. Aenean pulvinar porta orci a rhoncus. Integer ex velit, fringilla ac urna eget, rhoncus aliquet massa. Donec libero quam, feugiat at commodo non, ultrices sit amet felis. Proin mi tortor, dapibus ac tellus at, dapibus egestas orci. Proin finibus pellentesque mauris non volutpat. Quisque semper, odio vitae semper dignissim, tellus ipsum imperdiet orci, vitae sodales quam sapien nec tortor. Quisque ultricies nulla et dolor feugiat efficitur. Nullam tempus tristique risus, ac tincidunt lectus porttitor id. Sed accumsan, sapien eleifend porttitor maximus, metus felis pharetra massa, eu laoreet tellus velit non massa. Curabitur tincidunt vulputate consequat.\n\n\
                    Praesent at arcu id est tempus accumsan non fermentum libero. Duis lorem diam, egestas id sem sagittis, gravida volutpat lectus. Sed orci nibh, dictum at arcu vitae, cursus vulputate nulla. Fusce rhoncus at orci at euismod. Suspendisse potenti. Praesent purus turpis, viverra varius convallis nec, egestas id ipsum. Fusce accumsan, ipsum quis maximus feugiat, ante tellus vestibulum risus, eget condimentum metus tortor in turpis. Quisque vel ullamcorper ex, fermentum convallis ex. Cras viverra ultrices eleifend. Vestibulum hendrerit lacus ac turpis pretium vestibulum. Duis tristique hendrerit ornare. Aliquam erat volutpat.\n\n\
                    Nam id dictum enim, at iaculis justo. Curabitur metus lectus, porttitor in nisl ut, rhoncus dapibus diam. Mauris bibendum ipsum eu rutrum rhoncus. Donec vehicula ante bibendum velit fringilla laoreet. Sed aliquam tempus elementum. Fusce magna sapien, iaculis eget mi sit amet, venenatis aliquet lectus. Suspendisse vitae dui quam. Sed egestas vitae lorem nec facilisis. Nulla at lectus nunc. Nam a tristique libero, eget aliquet magna. Curabitur dui risus, placerat non ullamcorper ultricies, bibendum ut eros. Ut rutrum consequat nunc, ac pellentesque magna dignissim vitae. Maecenas purus leo, tempor ut aliquet at, fringilla quis diam.\n\n\
                    Donec eu urna sit amet risus scelerisque iaculis. Sed ut ex ut tortor posuere congue. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus a justo vel libero bibendum fringilla nec a eros. Nunc tempus dui nec placerat tincidunt. Cras vel tempor risus, sit amet lobortis eros. Proin in lectus aliquam, elementum ipsum quis, efficitur orci. Mauris sagittis nibh in pretium pharetra. Fusce a varius risus. Praesent ornare nunc lacus. Vestibulum egestas accumsan ipsum eget malesuada. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi ligula nibh, euismod sit amet cursus eget, hendrerit sit amet lectus. Suspendisse rhoncus massa scelerisque nunc posuere venenatis.\n\n\
                    In ante quam, finibus in fringilla ut, gravida a est. Ut sodales dignissim nibh eget faucibus. Donec eleifend velit neque, non accumsan arcu scelerisque at. Praesent sodales sodales eleifend. Vivamus non sodales orci. Curabitur volutpat, justo ac elementum aliquam, ex nulla tristique magna, vel maximus dolor nunc non leo. Vivamus dapibus vulputate elit et tempus. Cras ullamcorper ornare sem at tristique. Praesent ac fermentum tellus. Nullam mauris odio, blandit eu dolor et, rhoncus hendrerit urna. Morbi sed iaculis lorem."
                },
                {
                    name: "Village of Hopeman founded",
                    start: "1805AD",
                    description: "Village of Hopeman founded by Mr Young with land rented out to both farmers and fishermen. Colony of Fishermen from Ardersier/Cambeltown (Inverness area) settled in Hopeman. (McPherson; Moir/More; Davidson; Ralph; Young; etc )  First settlers included Mr Thomas Moir and Mr Donald Davidson (Peep)  First house - South West corner “Heatherhills” & Harbour House built on a rock",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline"
                },
                {
                    name: "Inverugie lime works founded",
                    description: "Inverugie lime works founded by Mr Young of Inverugie. Used a rail track down to harbour which may have been one of the first railways in Scotland.",
                    start: "1810AD",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline"
                },
                {
                    name: "Hopeman purchased",
                    description: "Hopeman purchased by William Stuart as part of Inverugie estate. Mr Stuart owned plantations on Granada in the West Indies",
                    historyCredit: "Hopeman History Website",
                    historyCreditLink: "https://hopemanhistory.org/timeline",
                    start: "1820"
                }
            ]
        }
    ]
}