const point_size = 3;
const cluster_size = 5;
const point_color = "black";
const cluster_color = "red";

const nb_clusters = 4;
const nb_points = 10000;

const cluster_distribution = 400;

const canvas_x = 750;
const canvas_y = 550;


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


function createCloud(nb_p=nb_points, nb_c=nb_clusters, c_dis=cluster_distribution){
  let new_points = [];
  c0 = {x:150, y:150};
  c1 = {x:350, y:150};
  clusters = [];
  for (let c =0; c < nb_c; ++c){
    clusters.push({x: Math.random()*canvas_x, y: Math.random()*canvas_y});
  }

  for (let p = 0; p < nb_p/nb_c; ++p ){
    for (let c of clusters){
      new_points.push({x: c.x + c_dis*(gaussianRand()-0.5), y: c.y + c_dis*(gaussianRand()-0.5)})
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
        .attr("fill", color);
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
  for (let p of points){
    drawCircle(p.x, p.y, point_size, point_color);
  }
}

init_figure();

let buttonLaunchClustering = document.getElementById("launchClustering");
buttonLaunchClustering.addEventListener('click', init_kmeans);


let cluster_centers = [];

function init_kmeans(){
    let temp_points = points.slice();
    temp_points = d3.shuffle(temp_points);

    cluster_centers = temp_points.slice(0, nb_clusters);

    //console.log('cluster_centers', cluster_centers);


    displayCenters(cluster_centers);
    cluster_points = computerClouds(points, cluster_centers);
    cluster_centers = updateCenters(cluster_points);
    displayCenters(cluster_centers);

    for (let i = 0; i<5; ++i){
      cluster_points = computerClouds(points, cluster_centers);
      cluster_centers = updateCenters(cluster_points);
      displayCenters(cluster_centers); ///SI ICI
    }
}


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
