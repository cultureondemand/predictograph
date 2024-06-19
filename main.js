import lineData from '/predictograph/data/line-data.js'

// Selecting the element
const element = document.getElementById('line-chart');

// Setting dimensions
const margin = {top: 0, right: 0, bottom: 0, left: 10},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

// Parsing timestamps
const parseTime = d3.timeParse('%Y/%m/%d');

const parsedData = lineData.map(item => (
    {
        values: item.values.map((val) => ({
            total: val.total,
            date: parseTime(val.date)
        }))
    }));

// Appending svg to a selected element
const svg = d3.select(element)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr("viewBox", `10 0 ${width + 10} ${height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Setting X,Y scale ranges
const xScale = d3.scaleTime()
    .domain([
        d3.min(parsedData, (d) => d3.min(d.values, (v) => v.date)),
        d3.max(parsedData, (d) => d3.max(d.values, (v) => v.date))
    ])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([
        d3.min(parsedData, (d) => d3.min(d.values, (v) => v.total)),
        d3.max(parsedData, (d) => d3.max(d.values, (v) => v.total))
    ])
    .range([height, 0]);

const chartSvg = svg.selectAll('.line')
    .data(parsedData)
    .enter();

// Drawing line with inner gradient and area
// Adding functionality to make line and area curved
const line = d3.line()
    .x(function(d) {
        return xScale(d.date);
    })
    .y(function(d) {
        return yScale(d.total);
    })
    .curve(d3.curveCatmullRom.alpha(1));

// Defining initial area, which appear on chart load
const zeroArea = d3.area()
    .x(function(d) { return xScale(d.date); })
    .y0(height)
    .y1(function() { return 0; })
   //// .curve(d3.curveCatmullRom.alpha(0.5));
    .curve(d3.curveCatmullRom.alpha(0));

// Defining the area, which appear after animation ends
const area = d3.area()
    .x(function(d) { return xScale(d.date); })
    .y0(height)
    .y1(function(d) { return yScale(d.total); })
   //// .curve(d3.curveCatmullRom.alpha(0.5));
    .curve(d3.curveCatmullRom.alpha(0));

// Defining the line path
const path = chartSvg.append('path')
    .attr('d', function(d) {
        return line(d.values)
    })
    .attr('stroke-width', '5')
    .style('fill', 'none')
    .attr('stroke', '#ff6f3c');

const length = path.node().getTotalLength(); // Get line length

// Drawing animated line
path.attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .delay(1500)
    .duration(30000)

// Drawing animated area
chartSvg.append("path")
    .attr("d", function(d) {
        return zeroArea(d.values)
    })
  /////  .style('fill', 'rgba(255,111,60,0.15)')
  .style('fill', 'rgba(255,255,255,1)')
  .transition()
    .duration(1500)
    .attr("d", function(d) {
        return area(d.values)
    })
   //// .style('fill', 'rgba(255,111,60,0.15)');
    .style('fill', 'rgba(255,255,255,1)');

// Adding the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

// Adding the y Axis
svg.append("g")
    .call(d3.axisLeft(yScale));