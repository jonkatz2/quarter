var margin = {
    top : 20,
    right : 40,
    bottom : 20,
    left : 100
  };


var yaxcol = options.yaxcol;
var	yaxreturn = options.yaxreturn;
var editing = options.editing;
var format = options.format;
var timeDomainStart = new Date(options.timeBounds[0]);//timeDomain[0];
var timeDomainEnd = new Date(options.timeBounds[1]);//timeDomain[1];
var taskTypes = [];
var height = height - margin.top - margin.bottom-5;
var width = width - margin.right - margin.left-5;
var HANDLE_R = 5;
var HANDLE_R_ACTIVE = 9;
var barheight = 35;
var yoffset = Math.round(barheight/2-3);
// `Ready to start`=0, `In Progress`=1, Complete=2, Deferred=3, Canceled=-1
var taskStatus = {
	"status0":"\uf251",
	"status1":"",
	"status2":"\uf00c",
	"status3":"\uf04c",
	"status-1":"\uf00d"
};

// var taskStatus = {
    // "SUCCEEDED" : "bar",
    // "FAILED" : "bar-failed",
    // "RUNNING" : "bar-running",
    // "KILLED" : "bar-killed"
// };

d3.select(".d3tooltip").remove();
// create a tooltip
var tooltip = d3.select("body")
	.append("div")
		.attr("class", "d3tooltip")
		.style("position", "absolute")
		.style("background-color", "#333")
		.style("color", "#FFF")
		.style("z-index", "-1")
		.style("opacity", "0")
		.style("padding", "5px")
		.style("max-width", "450px")
		.style("border-radius", "4px");

var mouseover = function(d) {
	if(d.description) {
		if(d.description != "") {
			tooltip
				.html(d.description)
				.style("opacity", 1)
				.style("z-index", "1000");
		}
	}
	d3.select(this)
		.raise()
		.style("stroke", "#333");
		// .style("opacity", 1);
};

var mousemove = function(d) {
	if(d.description) {
		if(d.description != "") {
			// var rc = d3.select(this),
				// loc = d3.mouse(rc.node().parentNode),
				// x0 = +rc.attr("data-x0"),
				// y0 = +rc.attr("data-y");
			var loc = d3.mouse(d3.select("body").node());
			tooltip
				.style("left", (loc[0]-35) + "px")
				.style("top", (loc[1]-60) + "px")
				// .style("left", (loc[0]+x0+margin.left+30) + "px")
				// .style("top", (loc[1]+y(y0)+15) + "px")
		}
	};
};

var mouseleave = function(d) {
	tooltip
		.html("")
		.style("opacity", 0)
		.style("z-index", "-1");
	d3.select(this)
		.style("stroke", "none");
		// .style("opacity", 0.8);
};


//var taskNames = d3.map(data, function(d) {return d.taskName;}).keys();
var yAxVal = d3.map(data, function(d) {return d[yaxcol];}).keys().sort(),
	yAxID = [];
yAxVal.forEach(function(d, i) {
	data.forEach(function(e, j) {
		if(d == e[yaxcol]) {
			if(!yAxID.includes(e[yaxreturn])) {
				yAxID.push(e[yaxreturn]);
			}
		}
	});
});



var colorScale = d3.scaleOrdinal(d3.schemeSet3).domain(yAxVal);

var x,y,xAxis,yAxis;

x = d3.scaleTime().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

// y = d3.scaleBand().domain(yAxVal).range([ 0, height - margin.top - margin.bottom ]).paddingInner(0.15);
y = d3.scaleLinear().domain([0, yAxVal.length]).range([ 0, height - margin.top - margin.bottom ]);


svg.selectAll("g").remove();
svg.selectAll("rect").remove();

xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat(format[0]))
  .tickSize(8).tickPadding(8).ticks(+format[1]);

// xAxis = d3.axisBottom().scale(x).tickFormat(multiFormat)
  // .tickSize(8).tickPadding(8).ticks(+format[1]);


yAxis = d3.axisLeft().scale(y).tickFormat(function(d) { return yAxVal[d]; }).tickSize(0).ticks(yAxVal.length);


var g = svg.append("g")
  .attr("class", "gantt-chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
  
  g.append("clipPath")
	  .attr("id", "taskerAreaClip")
	  .append("rect")
	  .attr('width', width)
	  .attr('height', height)
	  .attr("transform", "translate(0, -" + margin.top + ")");
  
  g.selectAll(".ybar")
	  .data(yAxVal).enter()
	  .append("g")
	  .attr("transform", function(d, i)	{
		return "translate(0, " + (y(i)-barheight/2-3) + ")"
	  })
	  .attr("class", "ybar")
	  .append("rect")
	  .attr("rx", 0)
	  .attr("ry", 0)
	  .attr("y", 0)
	  // .attr("y", function(d, i) {
		  // return y(i)-barheight/2-3;
	  // })
	  .attr("height", barheight+11)
	  .attr("width", width)
	  .style("fill", function(d, i) {
		  if(i % 2) {
			return "#f3f3f3";
		  } else {
			return "transparent"
		  }
	  });
	  
  
  g.append("rect")
      .attr("class", "click-zone")
      .attr("clip-path", "url(#taskerAreaClip)")
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)
      .style("cursor","crosshair")
      .on("dblclick", function() {
		if(editing) {
			let clickArea = d3.select(this).node();
			addTask(clickArea);
		}
      });
	  
  g.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
	.transition()
	.call(xAxis.ticks(format[1]));

	g.append("g").attr("class", "y-axis").transition().call(yAxis);

var drawany = false;

data.forEach(function(d, i) {
	if(d.startDate) {
		drawany = true;
		data[i].startDate = new Date(d.startDate);
		data[i].endDate = new Date(d.endDate);
	}
});


if(drawany) {
	data.sort(function(a, b) {
		return a.endDate - b.endDate;
	});

	var maxDate = data[data.length - 1].endDate;
	data.sort(function(a, b) {
		return a.startDate - b.startDate;
	});

	var minDate = data[0].startDate;

	function getEndDate() {
		var lastEndDate = Date.now();
		if (data.length > 0) {
				lastEndDate = data[data.length - 1].endDate;
		}
		return lastEndDate;
	}

	function truncate(input, wd) {
	   var chars = Math.floor(Math.max(0, wd/5));
	   if (input.length > chars)
		  return input.substring(0, chars) + '...';
	   else
		  return input;
	};


	var keyFunction = function(d) {
		return d.startDate + d[yaxcol] + d.endDate;
	};

	var rectTransform = function(d) {
		return "translate(" + Math.round(x(d.startDate)) + "," + (y(yAxVal.indexOf(d[yaxcol]))-yoffset) + ")";
	};

	var r = g.selectAll(".chart")
	  .data(data, keyFunction).enter()
	  .append("g")
	  .attr("class", "rectainer")
	  .attr("transform", rectTransform)
	  .attr("cursor", "grab")
	  .attr("data-y", function(d) {
		if(d[yaxcol]) {
			return yAxVal.indexOf(d[yaxcol]);
		}
	  })
	  .attr("data-id", function(d) {
		if(d.taskID) {
			return d.taskID;
		}
	  })
	  .attr("data-x0", function(d) {
		if(d.startDate) {
			return Math.round(x(d.startDate));
		}
	  })
	  .attr("data-x1", function(d) {
		  if(d.endDate) {
			return Math.round(x(d.endDate));
		  }
	  })
	  .attr("data-width", function(d) { 
		if(d.endDate) {
			return (Math.round(x(d.endDate) - x(d.startDate)));
		}
	  })
	  .on("touch", mouseover)
	  .on("mouseover", mouseover)
	  .on("mousemove", mousemove)
	  .on("mouseleave", mouseleave)
	  .call(d3.drag()
		.on("start", dragstart)
		.on("drag", dragging)
		.on("end", dragend))
	  .on('contextmenu', function(){ 
		if(editing) {
			d3.event.preventDefault();
			var rc = d3.select(this);
			// var loc = d3.mouse(rc.node().parentNode)
			menu(d3.event.pageX+20, d3.event.pageY, rc.attr("data-id"));
			// menu(loc[0]+margin.left, loc[1]+margin.top);
		}
	  });
	  
	r.append("rect")
	  .attr("rx", 5)
	  .attr("ry", 5)
	  .attr("class", "bar")
	  // .attr("class", function(d){ 
		// if(taskStatus[d.status] == null){ return "bar";}
		// return "bar " + taskStatus[d.status];
	  // }) 
	  .attr("y", 0)
	  // .attr("transform", rectTransform)
	  .attr("height", function(d) { 
			if(d.endDate) {
				return barheight; 
			}
		})
	  .attr("width", function(d) { 
			if(d.endDate) {
				return (x(d.endDate) - x(d.startDate));
			}
	  })
	  .style("fill", function(d) {
		  return colorScale(d[yaxcol]);
	  });

	r.append("text")
		.style("overflow", "hidden")
		.style("color", "#333")
		.attr("transform", "translate(5, 21)")
	    .style("opacity", 1)
		.html(function(d){
			if(d.taskName) {
				return truncate(d.taskName, x(d.endDate) - x(d.startDate) - barheight - 10)
			}
		});
		
		

	r.append("circle")
	  .classed("topleft", true)
	  .attr("r", function(d) {
			if(d.endDate) {
				return HANDLE_R;
			}
	  })
	  .attr("cx", 0)
	  .attr("cy", 0)
	  .style("fill", "#888888")
	  .on("mouseenter mouseleave", resizerHover)
	  .call(d3.drag()
		.container(g.node())
		.subject(function () {
		  return {x: d3.event.x, y: d3.event.y};
		})
		.on("start end", rectResizeStartEnd)
		.on("drag", rectResizing)
	  );
		  
	r.append("circle")
	  .classed("bottomright", true)
	  .attr("r", function(d) {
			if(d.endDate) {
				return HANDLE_R;
			}
	  })
	  .attr("cx", function (d) {
		if(d.endDate) {
			return (x(d.endDate) - x(d.startDate));
		}
	  })
	  .attr("cy", barheight)
	  .style("fill", "#888888")
	  .on("mouseenter mouseleave", resizerHover)
	  .call(d3.drag()
		.container(g.node())
		.subject(function () {
		  return {x: d3.event.x, y: d3.event.y};
		})
		.on("start end", rectResizeStartEnd)
		.on("drag", rectResizing)
	  );
	  
	var statcirc = r.append("g")
	  .attr("transform", function(d) {
	  return "translate(" + (x(d.endDate) - x(d.startDate) - (Math.round(barheight) * 0.8)) + "," + (barheight/2 - barheight * 0.5) + ")"})
	
	statcirc.append("circle")
	  .classed("statusindicator", true)
	  .attr("r", function(d) {
			if(d.endDate) {
				if(+d.status == 1) {
					return 0;
				} else {
					return Math.round(barheight * 0.4);
				}
			}
	  })
	  .attr("cx", function (d) {
		if(d.endDate) {
			return (Math.round(barheight * 0.4));
		}
	  })
	  .attr("cy", barheight/2)
	  .style("fill", "#888888")
	  .style("opacity", 0.3);
	
	
	statcirc.append('text')
		.attr('text-anchor', 'middle')
		.attr('class', 'fa')
		.attr('font-family', 'Font Awesome\ 5 Free')
		.attr('font-weight', 900)
		.attr('x', barheight*0.4)
		.attr('y', barheight*0.65)
		.attr('font-size', '14px')
		.attr('fill', '#333')
	    .style("opacity", 0.7)
		.text(function(d) { 
			return taskStatus["status"+d.status]; 
		});
	
	
	
	function resizerHover() {
		if(editing) {
			var el = d3.select(this), isEntering = d3.event.type === "mouseenter";
			el
			  .classed("hovering", isEntering)
			  .attr(
				"r",
				isEntering || el.classed("resizing") ?
				  HANDLE_R_ACTIVE : HANDLE_R
			  );
		}
	  }
	
	function rectResizeEnd(d) {
		if(editing) {
			var circ = d3.select(this);	
			var dad = d3.select(this.parentNode);		
			var x0 = formatDate(x.invert(+dad.attr("data-x0"))),
				x1 = formatDate(x.invert(+dad.attr("data-x1"))),
				y0 = yAxID[+dad.attr("data-y")],
				id = +dad.attr("data-id");
			Shiny.setInputValue("Tasker-resizeTask", {"taskid":id,"userid":y0,"start":x0,"end":x1}, {priority: "event"});
		}
	}
	
	function rectResizeStartEnd() {
		if(editing) {
			var el = d3.select(this), isStarting = d3.event.type === "start";
			d3.select(this)
			  .classed("resizing", isStarting)
			  .attr(
				"r",
				isStarting || el.classed("hovering") ?
				  HANDLE_R_ACTIVE : HANDLE_R
			  );
			if(!isStarting) {	
				var dad = d3.select(this.parentNode);		
				var x0 = formatDate(x.invert(+dad.attr("data-x0"))),
					x1 = formatDate(x.invert(+dad.attr("data-x1"))),
					y0 = yAxID[+dad.attr("data-y")],
					id = +dad.attr("data-id");
				Shiny.setInputValue("Tasker-resizeTask", {"taskid":id,"userid":y0,"start":x0,"end":x1}, {priority: "event"});
			};
		}
	  }

	  
	function rectResizing(d) {
		if(editing) {
			var circ = d3.select(this);
			var dad = d3.select(this.parentNode);
			var rc = dad.select("rect");
			var dragX = Math.round(d3.event.x);
			var y0 = +dad.attr("data-y"),
			  x0 = +dad.attr("data-x0"),
			  x1 = +dad.attr("data-x1");
			  
			// make task start earlier/later
			if (circ.classed("topleft")) {
			  var delt = dragX - x0;
			  var rhand = dad.select(".bottomright");
			  dad.attr("transform", function(d) {
				return "translate(" + (x0 + delt) + "," + (y(y0)-yoffset) + ")"; 
			  });
			  rc.attr("width", function(d) { 
				return (x1 - x0 - delt); 
			  });
			  rhand.attr("cx",function(d) { 
				return (x1 - x0 - delt);
			  });
			  dad.attr("data-x0", x0 + delt);
			// make task longer/shorter
			} else {
			  var delt = dragX - x1
			  rc.attr("width", function(d) { 
				return (x1 - x0 + delt); 
			  });
			  
			  circ.attr("cx",function(d) { 
				return (x1 - x0 + delt);
			  });
			  dad.attr("data-x1", dragX);
			}
		}
	  }
	
	
	function dragstart() {
		if(editing) {
			var rc = d3.select(this);
			rc
				.raise()
				.attr("data-width", function(d) {
					return Math.round(+rc.attr("data-x1") - +rc.attr("data-x0"));
				});	
			g.attr("cursor", "grabbing");
		}
	}

	function dragging(d) {
		if(editing) {
			var rc = d3.select(this);	
			var x0 = Math.round(d3.event.x), 
				y0 = Math.round(y.invert(d3.event.y)-0.4),
				wd = +rc.attr("data-width");
			var hw = wd*0.5;
			rc.attr("transform", "translate(" + (x0-hw) + "," + (y(y0)-15) + ")")
				.attr("cursor", "grabbing")
				.attr("data-y", y0)
				.attr("data-x0", x0 - hw)
				.attr("data-x1", x0 + hw);
		}
	}

	function dragend() {
		if(editing) {
			var rc = d3.select(this);	
			rc.attr("cursor", "grab");
			var x0 = formatDate(x.invert(+rc.attr("data-x0"))),
				x1 = formatDate(x.invert(+rc.attr("data-x1"))),
				y0 = yAxID[+rc.attr("data-y")],
				id = +rc.attr("data-id");
			if(x.invert(+rc.attr("data-x1")+5) >= timeDomainEnd) x1 = null;
			Shiny.setInputValue("Tasker-moveTask", {"taskid":id,"userid":y0,"start":x0,"end":x1}, {priority: "event"});
		}
	}

	// http://bl.ocks.org/jakosz/ce1e63d5149f64ac7ee9
	function menu(x, y, id) {
		d3.select('div.context-menu').remove();

		// Draw the menu
		var cm = d3.select("body")
			.append('div')
			.attr('class', 'context-menu')
			.style("box-shadow", "5px 10px 8px #888888")
			.style("position", "absolute")
			.style("border", "1px solid #888888")
			.style("left", x + "px")
			.style("top", y + "px")
			.append("ul")
				.attr("class", "context-ul")
				.style("font-size", "12px")
				.style("margin-left", "-40px")
				.style("margin-bottom", "0px")
				.style("list-style-type", "none");
			
		d3.select(".context-ul").selectAll("li")
			.data([
				{"name":"Edit", "callback":editevent, "divider":false}, 
				{"name":'<hr style="margin-top:5px;margin-bottom:0px;">', "callback":divider, "divider":true}, 
				{"name":'Status:', "callback":divider, "divider":true}, 
				{"name":'&nbsp;&nbsp;&nbsp;&nbsp;Ready', "callback":statusReady, "divider":false}, 
				{"name":'&nbsp;&nbsp;&nbsp;&nbsp;In Progress', "callback":statusGo, "divider":false}, 
				{"name":'&nbsp;&nbsp;&nbsp;&nbsp;Complete', "callback":statusDone, "divider":false}, 
				{"name":'&nbsp;&nbsp;&nbsp;&nbsp;On Hold', "callback":statusDeferred, "divider":false},
				{"name":'&nbsp;&nbsp;&nbsp;&nbsp;Canceled', "callback":statusCanceled, "divider":false}
			])
			.enter()
			.append('li')
				.attr('class', 'menu-entry')
				.style("padding","2px 25px 2px 15px")
				.style('cursor', 'pointer')
				.style('border', '1.5px #fff solid')
				.style('background-color', 'white')//
				.style('color', '#333')
				.html(function(d) {return d.name})
				.on('click', function(d){ 
					return d.callback(id);
				})
				.on('mouseover', function(d){ 
					if(!d.divider) {
						d3.select(this)
							.style('background-color', '#ccc') 
							.style('color', '#333')
					};
				})
				.on('mouseout', function(){ 
					d3.select(this)
						.style('background-color', '#fff')
						.style('color', '#333');
				});
		
		function editevent(id) {
			Shiny.setInputValue("Tasker-launchEditTaskModal", id, {priority: "event"});
		};
		function divider(id) {
			return null;
		};
		function statusReady(id) {
			Shiny.setInputValue("Tasker-setTaskStatus", {"id":id,"status":"0"}, {priority: "event"});
		};
		function statusGo(id) {
			Shiny.setInputValue("Tasker-setTaskStatus", {"id":id,"status":"1"}, {priority: "event"});
		};
		function statusDone(id) {
			Shiny.setInputValue("Tasker-setTaskStatus", {"id":id,"status":"2"}, {priority: "event"});
		};
		function statusDeferred(id) {
			Shiny.setInputValue("Tasker-setTaskStatus", {"id":id,"status":"3"}, {priority: "event"});
		};
		function statusCanceled(id) {
			Shiny.setInputValue("Tasker-setTaskStatus", {"id":id,"status":"-1"}, {priority: "event"});
		};
		

		// Other interactions
		$('body')
			.on('click', function() {
				d3.select('.context-menu').remove();
			});

	}
} 

/************ Add new task **************************/
var formatDate = d3.timeFormat("%Y-%m-%d %H:%M:%S");
function addTask(clickArea) {
  var pos = d3.mouse(clickArea);
  var xPos = formatDate(x.invert(pos[0]));
  var yPos = yAxID[Math.round(y.invert(pos[1]))];
  Shiny.setInputValue("Tasker-addEventFromD3", {"start":xPos,"user":yPos}, {priority: "event"});
  // data.push({"x":xPos, "y":yPos});
  // data.sort(compare);
}























