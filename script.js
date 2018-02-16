const point_size = 3;
const cluster_size = 5;
const point_color = "black";
const cluster_color = "red";

const nb_clusters = 4;
const nb_points = 1000;

const cluster_distribution = 400  ;

const canvas_x = 750;
const canvas_y = 550;

const colors = ["green", "blue", "yellow", "orange"];

let cluster_points = [];
let cluster_centers = [];

document.addEventListener("keydown", function(event) {
    // Space keydown
    if(event.keyCode === 32) {
        iterateKmeans();
    }
    if(event.keyCode === 82) {
      cluster_centers = [];
      init_figure();
    }
});

function init_centers(){
  let temp_points = points.slice();
  temp_points = d3.shuffle(temp_points);

  return temp_points.slice(0, nb_clusters);
};

function iterateKmeans() {
    if (cluster_centers.length === 0) {
        cluster_centers = init_centers();
    } else {
        cluster_centers = updateCenters(cluster_points);
    }
    cluster_points = computerClouds(points, cluster_centers);
    displayStrokes(cluster_points, cluster_centers);
    displayPointsColors(cluster_points);
    displayCenters(cluster_centers);

}

// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = canvas_x - margin.left - margin.right,
    height = canvas_y - margin.top - margin.bottom;

let points = createCloud();

function gaussianRand(theta=4) {
  let rand = 0;
  for (let i = 0; i < theta; i += 1) {
    rand += Math.random();
  }
  return rand / theta;
}

function isInsideCanvas(point){
  if (point.x < 0 || point.x > canvas_x){return false;};
  if (point.y < 0 || point.y > canvas_y){return false;};
  return true;
}

function createCloud(nb_p=nb_points, nb_c=nb_clusters, c_dis=cluster_distribution){
  let new_points = [];
  clusters = [];
  for (let c =0; c < nb_c; ++c){
    clusters.push({x: Math.random()*canvas_x, y: Math.random()*canvas_y});
  }

  for (let p = 0; p < nb_p/nb_c; ++p ){
    for (let c of clusters){
      let new_point = {x: c.x + c_dis*(gaussianRand()-0.5), y: c.y + c_dis*(gaussianRand()-0.5)}
      if(isInsideCanvas(new_point) == true){
        new_points.push(new_point)
      }
    }
  }
  return new_points;
}




let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", function(){
        points.push({x: d3.mouse(this)[0], y: d3.mouse(this)[1]});
        drawCircle(d3.mouse(this)[0], d3.mouse(this)[1], point_size);
    });


function drawCircle(x, y, size, color=point_color) {
    svg.append("circle")
        .attr('class', 'click-circle')
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .attr("fill", color)
        .attr("fill-opacity", 0.5)
        .style("stroke", "black")
        .style("stroke-width", "1px");
}

function displayCenters(centers) {
    svg.selectAll(".center-circle").remove();

    for (let c of centers){
        svg.append("circle")
            .attr('class', 'center-circle')
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("r", cluster_size)
            .attr("fill", cluster_color);
    }
}

function init_figure(){
  svg.selectAll(".center-circle").remove();
  svg.selectAll(".click-circle").remove();
  svg.selectAll(".line").remove();

  for (let p of points){
    drawCircle(p.x, p.y, point_size, point_color);
  }
}

function displayStroke(c, p, color='black'){
  svg.append("line")
      .attr('class', 'line')
      .attr('x1', c.x)
      .attr('y1', c.y)
      .attr('x2', p.x)
      .attr('y2', p.y)
      .attr("stroke", color)
      .attr('opacity', 0.2);
}

function displayStrokes(cluster_points, cluster_centers){
  svg.selectAll(".line").remove();
  for (let i =0; i < nb_clusters; ++i){
    let c = cluster_centers[i];
    let color = colors[i];
    for (let p of cluster_points[i]){
      displayStroke(c, p, color);
    }
  }
}



init_figure();




function displayPointsColors(cpoints) {
    // les points ne sont pas dans le bon ordre, pas bonne coloration
    // let data = [];
    // for (let i = 0, len = cpoints.length ; i < len ; i++) {
    //     let cloud = cpoints[i];
    //     for (let j = 0, lenj = cloud.length ; j < lenj ; j++) {
    //         let point = cloud[j];
    //         point.center = i;
    //         data.push(point);
    //     }
    // }
    // console.log(data);
    // svg.selectAll(".click-circle")
    //     .data(data)
    //     // .enter()
    //     .transition()
    //     .duration(250)
    //     // .append("circle")  // Add circle svg
    //     .attr("fill", function(d) {
    //         return colors[d.center];  // Circle's X
    //     })

    svg.selectAll(".click-circle")
        .data(points)
        // .enter()
        .transition()
        .duration(400)
        // .append("circle")  // Add circle svg
        .attr("fill", function(d) {
            return colors[d.center];  // Circle's X
        })
}

// let cluster_centers = [];

function computerClouds(points, cluster_centers){
    let cluster_points = []; // stores all the points to its cluster_points
    for (let cluster_idx=0; cluster_idx < nb_clusters; ++cluster_idx){
        let c_points = [];
        cluster_points.push(c_points);
    }

    for (let p of points) {
        let dist = [];
        for (let c of cluster_centers) {
            let distance =Math.hypot(p.x - c.x, p.y - c.y);
            if (isNaN(distance)){distance = 0};
            dist.push(distance);
        }

        let nearest_cluster = dist.indexOf(Math.min(...dist)); //min dist
        cluster_points[nearest_cluster].push(p);
        // Il faut l'info sur les centres (quel point à quel centre au niveau des points pour la visu)
        p.center = nearest_cluster;
    }
    return cluster_points;
}


function updateCenters(cluster_points){
    let new_cluster_centers = [];
    for(let c_points of cluster_points){
        let sumX = 0;
        let sumY = 0;
        for(let p of c_points){
            sumX += p.x;
            sumY += p.y;
        }
        new_cluster_centers.push({x:sumX/c_points.length, y:sumY/c_points.length});
    }
    return new_cluster_centers;
}
