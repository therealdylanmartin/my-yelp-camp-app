mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
    container: 'campground-map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [long, lat], // starting position [lng, lat]
    zoom: 5 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);