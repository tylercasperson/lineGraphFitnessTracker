const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight + margin.top + margin.bottom)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

const xAxisGroup = graph
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0, ' + graphHeight + ')');

const yAxisGroup = graph.append('g').attr('class', 'y-axis');

const update = (data) => {
  data.filter((item) => item.activity == activity);

  x.domain(d3.extent(data, (d) => new Date(d.date)));
  y.domain([0, d3.max(data, (d) => d.distance)]);

  const circles = graph.selectAll('circle').data(data);

  circles.exit().remove();

  circles
    .attr('r', 4)
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.distance));

  circles
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('cx', (d) => x(new Date(d.date)))
    .attr('cy', (d) => y(d.distance))
    .attr('fill', '#ccc');

  const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %d'));

  const yAxis = d3
    .axisLeft(y)
    .ticks(4)
    .tickFormat((d) => d + 'm');

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  xAxisGroup
    .selectAll('text')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end');
};

var data = [];

db.collection('activities').onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex((item) => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});
