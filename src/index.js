import * as d3 from 'd3';
import './styles.css';

fetch(
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json',
)
  .then((response) => response.json())
  .then((data) => {
    let width = 1500;
    let height = 800;
    let padding = { left: 100, bottom: 100, top: 150, right: 25 };
    let dopingColor = 'red';
    let noDopingColor = 'blue';
    let legendHeaders = ['withDopingAllegations', 'noDopingAllegations'];

    let xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year)])
      .range([padding.left, width - padding.right]);

    let yScale = d3
      .scaleLinear()
      .domain([d3.max(data, (d) => d.Seconds), d3.min(data, (d) => d.Seconds)])
      .range([height - padding.bottom, padding.top]);

    //chart area
    let chart = d3
      .select('#chart-area')
      .append('svg')
      .attr('id', 'chart')
      .attr('height', height)
      .attr('width', width);

    //axes
    let xAxis = d3.axisBottom(xScale).tickFormat((d) => `${d}`);
    let yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => `${Math.floor(d / 60)}:${d % 60 < 10 ? '0' : ''}${d % 60}`);

    //x axis
    chart
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height - padding.bottom})`)
      .call(xAxis);
    chart
      .append('g')
      .attr('id', 'x-axis-label')
      .append('text')
      .attr('font-size', '1.5em')
      .text('Year')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${width / 2 + padding.left}, ${height - padding.bottom + 50})`);

    //y axis
    chart
      .append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding.left}, 0)`)
      .call(yAxis);
    chart
      .append('g')
      .attr('id', 'y-axis-label')
      .append('text')
      .text('Time in Minutes (mm:ss)')
      .attr('font-size', '1.5em')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('transform', `rotate(-90) translate(-${height / 2}, ${padding.left - 70})`);

    //chart title
    chart
      .append('g')
      .attr('id', 'title-wrapper')
      .append('text')
      .attr('id', 'title')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${xScale(d3.max(data, (d) => d.Year)) / 2 + padding.left}, ${padding.top / 2})`,
      )
      .text('Doping in Professional Bicycle Racing')
      .attr('font-size', '2em');

    //plot
    chart
      .append('g')
      .attr('id', 'scatter-plot-area')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('data-xvalue', (d) => d.Year)
      .attr('data-yvalue', (d) => new Date(0, 0, 0, 0, 0, d.Seconds))
      .attr('r', '6')
      .attr('fill', (d) => (d.Doping != '' ? dopingColor : noDopingColor))
      .style('stroke', 'black')
      .attr('cx', (d) => xScale(d.Year))
      .attr('cy', (d) => yScale(d.Seconds));

    //legend
    let legend = chart
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width - padding.right}, ${height / 2 - 30})`)
      .selectAll('g')
      .data(legendHeaders)
      .enter()
      .append('g')
      .attr('id', (d) => d);
    legend
      .append('rect')
      .attr('height', '20px')
      .attr('width', '20px')
      .attr('fill', (d) => (d == 'withDopingAllegations' ? dopingColor : noDopingColor))
      .attr('transform', (d) => `translate(0, ${legendHeaders.indexOf(d) * 20})`);
    legend
      .append('text')
      .text((d) =>
        legendHeaders.indexOf(d) == 0 ? 'No doping allegations' : 'With doping allegations',
      )
      .attr('text-anchor', 'end')
      .attr('transform', (d) => `translate(-5, ${(1 + legendHeaders.indexOf(d)) * 20 - 2})`);

    //tooltip and hover interaction
    chart.selectAll('circle').on('mouseenter', function (e) {
      d3.select(this).attr('fill', 'green');
      let data = d3.select(this).data()[0];

      d3.select('#chart-area')
        .append('div')
        .attr('id', 'tooltip')
        .attr('data-year', data.Year)
        .style('top', e.pageY + 'px')
        .style('left', e.pageX + 15 + 'px') //distances the box 15 px to the right of pointer
        .style('transform', 'translate(0, -50%)') //use the vertical center as anchor for the position, not top left
        .html(
          `${data.Name}<br>${data.Nationality}<br >Year: ${data.Year} Time: ${data.Time}${
            data.Doping != '' ? '<br style="margin-bottom: 10px ">' + data.Doping : ''
          }`,
        );
    });
    chart.selectAll('circle').on('mousemove', function (e) {
      //move the tooltip with the pointer along the dot
      d3.select('#tooltip')
        .style('top', e.pageY + 'px')
        .style('left', e.pageX + 15 + 'px');
    });
    chart.selectAll('circle').on('mouseleave', function () {
      let data = d3.select(this).data()[0]; //get the data of the hovered item
      d3.select(this).attr('fill', data.Doping != '' ? dopingColor : noDopingColor);
      d3.select('#tooltip').remove(); //remove tooltip when moving out of the point
    });
  });
