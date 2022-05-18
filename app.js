
const drawMap = async () => {
    
    const path = d3.geoPath(projection);

    const dataset = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    
    const countries = topojson
        .feature(dataset, dataset.objects.countries);
        
    ctr.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path);
    
}

const drawData = async (year, type) => {

    let dataset = await d3.csv('dataset.csv')
    
    const latAccesor = (d) => d.latitude
    const logAccesor = (d) => d.longitude

    const hAccesor = (d) => parseInt(d.deforestation_risk)

    const hScale = d3.scaleLinear()
        .domain(d3.extent(dataset, hAccesor))
        .rangeRound([6, 50])

        dataset = dataset.filter((d) => {
            return d.year == year && d.type == type
        });
    
    let class_c = 'country_circle_consumer'
    if(type == 'p') class_c = 'country_circle_producer'
    
    const producers = ctr.append('g')

    producers.selectAll('circle')
        .data(dataset)
        .join('circle')
        .attr('cx', (d) => projection([d.longitude,d.latitude])[0])
        .attr('cy', (d) => projection([d.longitude,d.latitude])[1])
        .attr('class', class_c)
        .attr('country', (d) => d.producer_region)
        .attr('type', (d) => d.type)
        .attr('r', (d) => hScale(d.deforestation_risk))
        .attr('deforestation', (d) => d.deforestation_risk)
        .on('touchmouse mousemove', function(event){

            const mousePos = d3.pointer(event, this)
            const type = d3.select(event.target).attr('type')

            let class_c = 'country_circle_consumer_selected'
            if(type == 'p') class_c = 'country_circle_producer_selected'

            const country =d3.select(event.target).attr('country')
            const deforestation =d3.select(event.target).attr('deforestation')

            d3.select(event.target).attr('class', class_c)

            tooltip.transition()
                .duration(200)
                .style("opacity", .9)

            tooltip.html(`<strong>${country}</strong><label><br/>${deforestation} ha.</label>`)
                .style("left", (event.pageX-84/2) + "px")
                .style("top", (event.pageY - 50) + "px")
                .style('width', "100px")
                .style('height', "40px")

        })
        .on('mouseleave', function(event){
            tooltip.transition()        
            .duration(100)      
            .style("opacity", 0);

            const type = d3.select(event.target).attr('type')

            let class_c = 'country_circle_consumer'
            if(type == 'p') class_c = 'country_circle_producer'

            d3.select(event.target).attr('class', class_c)
        })

}

function showVal(value){
    document.getElementById('rangeValue').innerHTML = value;
    ctr.selectAll("circle").remove()
    drawData(value, 'c', '#0000ff')
    drawData(value, 'p', '#dd1bd9')
}

const width = 900;
const height = 600;

const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

const ctr = svg.append('g');

const projection = d3.geoMercator()
        .scale(120)
        .translate([width / 2, height / 1.4]);

const year = 2005
document.getElementById('rangeValue').innerHTML = year;

drawMap()
drawData(year, 'c')
drawData(year, 'p')

const tooltip = d3.select('#tooltip')
