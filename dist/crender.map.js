(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var CRender = require('../lib/index')

window.CRender = CRender
},{"../lib/index":6}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _color = _interopRequireDefault(require("@jiaminghi/color"));

var _bezierCurve = _interopRequireDefault(require("@jiaminghi/bezier-curve"));

var _util = require("../plugin/util");

var _graphs = _interopRequireDefault(require("../config/graphs"));

var _graph = _interopRequireDefault(require("./graph.class"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * @description           Class of CRender
 * @param {Object} canvas Canvas DOM
 * @return {CRender}      Instance of CRender
 */
var CRender = function CRender(canvas) {
  (0, _classCallCheck2["default"])(this, CRender);

  if (!canvas) {
    console.error('CRender Missing parameters!');
    return;
  }

  var ctx = canvas.getContext('2d');
  var clientWidth = canvas.clientWidth,
      clientHeight = canvas.clientHeight;
  var area = [clientWidth, clientHeight];
  canvas.setAttribute('width', clientWidth);
  canvas.setAttribute('height', clientHeight);
  /**
   * @description Context of the canvas
   * @type {Object}
   * @example ctx = canvas.getContext('2d')
   */

  this.ctx = ctx;
  /**
   * @description Width and height of the canvas
   * @type {Array}
   * @example area = [300，100]
   */

  this.area = area;
  /**
   * @description Whether render is in animation rendering
   * @type {Boolean}
   * @example animationStatus = true|false
   */

  this.animationStatus = false;
  /**
   * @description Added graph
   * @type {[Graph]}
   * @example graphs = [Graph, Graph, ...]
   */

  this.graphs = [];
  /**
   * @description Color plugin
   * @type {Object}
   * @link https://github.com/jiaming743/color
   */

  this.color = _color["default"];
  /**
   * @description Bezier Curve plugin
   * @type {Object}
   * @link https://github.com/jiaming743/BezierCurve
   */

  this.bezierCurve = _bezierCurve["default"]; // bind event handler

  canvas.addEventListener('mousedown', mouseDown.bind(this));
  canvas.addEventListener('mousemove', mouseMove.bind(this));
  canvas.addEventListener('mouseup', mouseUp.bind(this));
};
/**
 * @description        Clear canvas drawing area
 * @return {Undefined} Void
 */


exports["default"] = CRender;

CRender.prototype.clearArea = function () {
  var _this$ctx;

  var area = this.area;

  (_this$ctx = this.ctx).clearRect.apply(_this$ctx, [0, 0].concat((0, _toConsumableArray2["default"])(area)));
};
/**
 * @description           Add graph to render
 * @param {Object} config Graph configuration
 * @return {Graph}        Graph instance
 */


CRender.prototype.add = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var name = config.name;

  if (!name) {
    console.error('add Missing parameters!');
    return;
  }

  var graphConfig = _graphs["default"].get(name);

  if (!graphConfig) {
    console.warn('No corresponding graph configuration found!');
    return;
  }

  var graph = new _graph["default"](graphConfig, config);
  if (!graph.validator(graph)) return;
  graph.render = this;
  this.graphs.push(graph);
  this.sortGraphsByIndex();
  this.drawAllGraph();
  return graph;
};
/**
 * @description Sort the graph by index
 * @return {Undefined} Void
 */


CRender.prototype.sortGraphsByIndex = function () {
  var graphs = this.graphs;
  graphs.sort(function (a, b) {
    if (a.index > b.index) return 1;
    if (a.index === b.index) return 0;
    if (a.index < b.index) return -1;
  });
};
/**
 * @description         Delete graph in render
 * @param {Graph} graph The graph to be deleted
 * @return {Undefined}  Void
 */


CRender.prototype.delGraph = function (graph) {
  if (typeof graph.delProcessor !== 'function') return;
  graph.delProcessor(this);
  this.graphs = this.graphs.filter(function (graph) {
    return graph;
  });
  this.drawAllGraph();
};
/**
 * @description        Delete all graph in render
 * @return {Undefined} Void
 */


CRender.prototype.delAllGraph = function () {
  var _this = this;

  this.graphs.forEach(function (graph) {
    return graph.delProcessor(_this);
  });
  this.graphs = this.graphs.filter(function (graph) {
    return graph;
  });
  this.drawAllGraph();
};
/**
 * @description        Draw all the graphs in the render
 * @return {Undefined} Void
 */


CRender.prototype.drawAllGraph = function () {
  var _this2 = this;

  this.clearArea();
  this.graphs.filter(function (graph) {
    return graph && graph.visible;
  }).forEach(function (graph) {
    return graph.drawProcessor(_this2, graph);
  });
};
/**
 * @description      Animate the graph whose animation queue is not empty
 *                   and the animationPause is equal to false
 * @return {Promise} Animation Promise
 */


CRender.prototype.launchAnimation = function () {
  var _this3 = this;

  var animationStatus = this.animationStatus;
  if (animationStatus) return;
  this.animationStatus = true;
  return new Promise(function (resolve) {
    animation.call(_this3, function () {
      _this3.animationStatus = false;
      resolve();
    }, Date.now());
  });
};
/**
 * @description Try to animate every graph
 * @param {Function} callback Callback in animation end
 * @param {Number} timeStamp  Time stamp of animation start
 * @return {Undefined} Void
 */


function animation(callback, timeStamp) {
  var graphs = this.graphs;

  if (!animationAble(graphs)) {
    callback();
    return;
  }

  graphs.forEach(function (graph) {
    return graph.turnNextAnimationFrame(timeStamp);
  });
  this.drawAllGraph();
  requestAnimationFrame(animation.bind(this, callback, timeStamp));
}
/**
 * @description Find if there are graph that can be animated
 * @param {[Graph]} graphs
 * @return {Boolean}
 */


function animationAble(graphs) {
  return graphs.find(function (graph) {
    return !graph.animationPause && graph.animationFrameState.length;
  });
}
/**
 * @description Handler of CRender mousedown event
 * @return {Undefined} Void
 */


function mouseDown(e) {
  var graphs = this.graphs;
  var hoverGraph = graphs.find(function (graph) {
    return graph.status === 'hover';
  });
  if (!hoverGraph) return;
  hoverGraph.status = 'active';
}
/**
 * @description Handler of CRender mousemove event
 * @return {Undefined} Void
 */


function mouseMove(e) {
  var offsetX = e.offsetX,
      offsetY = e.offsetY;
  var position = [offsetX, offsetY];
  var graphs = this.graphs;
  var activeGraph = graphs.find(function (graph) {
    return graph.status === 'active' || graph.status === 'drag';
  });

  if (activeGraph) {
    if (!activeGraph.drag) return;

    if (typeof activeGraph.move !== 'function') {
      console.error('No move method is provided, cannot be dragged!');
      return;
    }

    activeGraph.moveProcessor(e);
    activeGraph.status = 'drag';
    return;
  }

  var hoverGraph = graphs.find(function (graph) {
    return graph.status === 'hover';
  });
  var hoverAbleGraphs = graphs.filter(function (graph) {
    return graph.hover && (typeof graph.hoverCheck === 'function' || graph.hoverRect);
  });
  var hoveredGraph = hoverAbleGraphs.find(function (graph) {
    return graph.hoverCheckProcessor(position, graph);
  });

  if (hoveredGraph) {
    document.body.style.cursor = hoveredGraph.style.hoverCursor;
  } else {
    document.body.style.cursor = 'default';
  }

  var hoverGraphMouseOuterIsFun = false,
      hoveredGraphMouseEnterIsFun = false;
  if (hoverGraph) hoverGraphMouseOuterIsFun = typeof hoverGraph.mouseOuter === 'function';
  if (hoveredGraph) hoveredGraphMouseEnterIsFun = typeof hoveredGraph.mouseEnter === 'function';
  if (!hoveredGraph && !hoverGraph) return;

  if (!hoveredGraph && hoverGraph) {
    if (hoverGraphMouseOuterIsFun) hoverGraph.mouseOuter(e, hoverGraph);
    hoverGraph.status = 'static';
    return;
  }

  if (hoveredGraph && hoveredGraph === hoverGraph) return;

  if (hoveredGraph && !hoverGraph) {
    if (hoveredGraphMouseEnterIsFun) hoveredGraph.mouseEnter(e, hoveredGraph);
    hoveredGraph.status = 'hover';
    return;
  }

  if (hoveredGraph && hoverGraph && hoveredGraph !== hoverGraph) {
    if (hoverGraphMouseOuterIsFun) hoverGraph.mouseOuter(e, hoverGraph);
    hoverGraph.status = 'static';
    if (hoveredGraphMouseEnterIsFun) hoveredGraph.mouseEnter(e, hoveredGraph);
    hoveredGraph.status = 'hover';
  }
}
/**
 * @description Handler of CRender mouseup event
 * @return {Undefined} Void
 */


function mouseUp(e) {
  var graphs = this.graphs;
  var activeGraph = graphs.find(function (graph) {
    return graph.status === 'active';
  });
  var dragGraph = graphs.find(function (graph) {
    return graph.status === 'drag';
  });
  if (activeGraph && typeof activeGraph.click === 'function') activeGraph.click(e, activeGraph);
  graphs.forEach(function (graph) {
    return graph && (graph.status = 'static');
  });
  if (activeGraph) activeGraph.status = 'hover';
  if (dragGraph) dragGraph.status = 'hover';
}
/**
 * @description         Clone Graph
 * @param {Graph} graph The target to be cloned
 * @return {Graph}      Cloned graph
 */


CRender.prototype.clone = function (graph) {
  var style = graph.style.getStyle();

  var clonedGraph = _objectSpread({}, graph, {
    style: style
  });

  delete clonedGraph.render;
  clonedGraph = (0, _util.deepClone)(clonedGraph, true);
  return this.add(clonedGraph);
};
},{"../config/graphs":5,"../plugin/util":8,"./graph.class":3,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/defineProperty":13,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/toConsumableArray":20,"@jiaminghi/bezier-curve":25,"@jiaminghi/color":27}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _style = _interopRequireDefault(require("./style.class"));

var _transition = _interopRequireDefault(require("@jiaminghi/transition"));

var _util = require("../plugin/util");

var Graph = function Graph(graph, config) {
  (0, _classCallCheck2["default"])(this, Graph);
  config = (0, _util.deepClone)(config, true);
  var defaultConfig = {
    /**
     * @description Weather to render graph
     * @type {Boolean}
     * @default visible = true
     */
    visible: true,

    /**
     * @description Whether to enable drag
     * @type {Boolean}
     * @default drag = false
     */
    drag: false,

    /**
     * @description Whether to enable hover
     * @type {Boolean}
     * @default hover = false
     */
    hover: false,

    /**
     * @description Graph rendering index
     *  Give priority to index high graph in rendering
     * @type {Number}
     * @example index = 1
     */
    index: 1,

    /**
     * @description Animation delay time(ms)
     * @type {Number}
     * @default animationDelay = 0
     */
    animationDelay: 0,

    /**
     * @description Number of animation frames
     * @type {Number}
     * @default animationFrame = 30
     */
    animationFrame: 30,

    /**
     * @description Animation dynamic curve (Supported by transition)
     * @type {String}
     * @default animationCurve = 'linear'
     * @link https://github.com/jiaming743/Transition
     */
    animationCurve: 'linear',

    /**
     * @description Weather to pause graph animation
     * @type {Boolean}
     * @default animationPause = false
     */
    animationPause: false,

    /**
     * @description Rectangular hover detection zone
     *  Use this method for hover detection first
     * @type {Null|Array}
     * @default hoverRect = null
     * @example hoverRect = [0, 0, 100, 100] // [Rect start x, y, Rect width, height]
     */
    hoverRect: null,

    /**
     * @description Mouse enter event handler
     * @type {Function|Null}
     * @default mouseEnter = null
     */
    mouseEnter: null,

    /**
     * @description Mouse outer event handler
     * @type {Function|Null}
     * @default mouseOuter = null
     */
    mouseOuter: null,

    /**
     * @description Mouse click event handler
     * @type {Function|Null}
     * @default click = null
     */
    click: null
  };
  var configAbleNot = {
    status: 'static',
    animationRoot: [],
    animationKeys: [],
    animationFrameState: [],
    cache: {}
  };
  if (!config.shape) config.shape = {};
  if (!config.style) config.style = {};
  var shape = Object.assign({}, graph.shape, config.shape);
  Object.assign(defaultConfig, config, configAbleNot);
  Object.assign(this, graph, defaultConfig);
  this.shape = shape;
  this.style = new _style["default"](config.style);
  this.addedProcessor();
};
/**
 * @description Processor of added
 * @return {Undefined} Void
 */


exports["default"] = Graph;

Graph.prototype.addedProcessor = function () {
  if (typeof this.setGraphCenter === 'function') this.setGraphCenter(null, this); // The life cycle 'added"

  if (typeof this.added === 'function') this.added(this);
};
/**
 * @description Processor of draw
 * @param {CRender} render Instance of CRender
 * @param {Graph} graph    Instance of Graph
 * @return {Undefined} Void
 */


Graph.prototype.drawProcessor = function (render, graph) {
  var ctx = render.ctx;
  graph.style.initStyle(ctx);
  if (typeof this.beforeDraw === 'function') this.beforeDraw(this, render);
  graph.draw(render, graph);
  if (typeof this.drawed === 'function') this.drawed(this, render);
  graph.style.restoreTransform(ctx);
};
/**
 * @description Processor of hover check
 * @param {Array} position Mouse Position
 * @param {Graph} graph    Instance of Graph
 * @return {Boolean} Result of hover check
 */


Graph.prototype.hoverCheckProcessor = function (position, _ref) {
  var hoverRect = _ref.hoverRect,
      style = _ref.style,
      hoverCheck = _ref.hoverCheck;
  var graphCenter = style.graphCenter,
      rotate = style.rotate,
      scale = style.scale,
      translate = style.translate;

  if (graphCenter) {
    if (rotate) position = (0, _util.getRotatePointPos)(-rotate, position, graphCenter);
    if (scale) position = (0, _util.getScalePointPos)(scale.map(function (s) {
      return 1 / s;
    }), position, graphCenter);
    if (translate) position = (0, _util.getTranslatePointPos)(translate.map(function (v) {
      return v * -1;
    }), position);
  }

  if (hoverRect) return _util.checkPointIsInRect.apply(void 0, [position].concat((0, _toConsumableArray2["default"])(hoverRect)));
  return hoverCheck(position, this);
};
/**
 * @description Processor of move
 * @param {Event} e Mouse movement event
 * @return {Undefined} Void
 */


Graph.prototype.moveProcessor = function (e) {
  this.move(e, this);
  if (typeof this.beforeMove === 'function') this.beforeMove(e, this);
  if (typeof this.setGraphCenter === 'function') this.setGraphCenter(e, this);
  if (typeof this.moved === 'function') this.moved(e, this);
};
/**
 * @description Update graph state
 * @param {String} attrName Updated attribute name
 * @param {Any} change      Updated value
 * @return {Undefined} Void
 */


Graph.prototype.attr = function (attrName) {
  var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (!attrName || change === undefined) return false;
  var isObject = (0, _typeof2["default"])(this[attrName]) === 'object';
  if (isObject) change = (0, _util.deepClone)(change, true);
  var render = this.render;

  if (attrName === 'style') {
    this.style.update(change);
  } else if (isObject) {
    Object.assign(this[attrName], change);
  } else {
    this[attrName] = change;
  }

  if (attrName === 'index') render.sortGraphsByIndex();
  render.drawAllGraph();
};
/**
 * @description Update graphics state (with animation)
 *  Only shape and style attributes are supported
 * @param {String} attrName Updated attribute name
 * @param {Any} change      Updated value
 * @param {Boolean} wait    Whether to store the animation waiting
 *                          for the next animation request
 * @return {Promise} Animation Promise
 */


Graph.prototype.animation =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(attrName, change) {
    var wait,
        changeRoot,
        changeKeys,
        beforeState,
        animationFrame,
        animationCurve,
        animationDelay,
        animationFrameState,
        render,
        _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            wait = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;

            if (!(attrName !== 'shape' && attrName !== 'style')) {
              _context2.next = 4;
              break;
            }

            console.error('Only supported shape and style animation!');
            return _context2.abrupt("return");

          case 4:
            change = (0, _util.deepClone)(change, true);
            if (attrName === 'style') this.style.colorProcessor(change);
            changeRoot = this[attrName];
            changeKeys = Object.keys(change);
            beforeState = {};
            changeKeys.forEach(function (key) {
              return beforeState[key] = changeRoot[key];
            });
            animationFrame = this.animationFrame, animationCurve = this.animationCurve, animationDelay = this.animationDelay;
            animationFrameState = (0, _transition["default"])(animationCurve, beforeState, change, animationFrame, true);
            this.animationRoot.push(changeRoot);
            this.animationKeys.push(changeKeys);
            this.animationFrameState.push(animationFrameState);

            if (!wait) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return");

          case 17:
            if (!(animationDelay > 0)) {
              _context2.next = 20;
              break;
            }

            _context2.next = 20;
            return delay(animationDelay);

          case 20:
            render = this.render;
            return _context2.abrupt("return", new Promise(
            /*#__PURE__*/
            function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee(resolve) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return render.launchAnimation();

                      case 2:
                        resolve();

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }()));

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * @description Extract the next frame of data from the animation queue
 *              and update the graph state
 * @return {Undefined} Void
 */


Graph.prototype.turnNextAnimationFrame = function (timeStamp) {
  var animationDelay = this.animationDelay,
      animationRoot = this.animationRoot,
      animationKeys = this.animationKeys,
      animationFrameState = this.animationFrameState,
      animationPause = this.animationPause;
  if (animationPause) return;
  if (Date.now() - timeStamp < animationDelay) return;
  animationRoot.forEach(function (root, i) {
    animationKeys[i].forEach(function (key) {
      root[key] = animationFrameState[i][0][key];
    });
  });
  animationFrameState.forEach(function (stateItem, i) {
    stateItem.shift();
    var noFrame = stateItem.length === 0;
    if (noFrame) animationRoot[i] = null;
    if (noFrame) animationKeys[i] = null;
  });
  this.animationFrameState = animationFrameState.filter(function (state) {
    return state.length;
  });
  this.animationRoot = animationRoot.filter(function (root) {
    return root;
  });
  this.animationKeys = animationKeys.filter(function (keys) {
    return keys;
  });
};
/**
 * @description Skip to the last frame of animation
 * @return {Undefined} Void
 */


Graph.prototype.animationEnd = function () {
  var animationFrameState = this.animationFrameState,
      animationKeys = this.animationKeys,
      animationRoot = this.animationRoot,
      render = this.render;
  animationRoot.forEach(function (root, i) {
    var currentKeys = animationKeys[i];
    var lastState = animationFrameState[i].pop();
    currentKeys.forEach(function (key) {
      return root[key] = lastState[key];
    });
  });
  this.animationFrameState = [];
  this.animationKeys = [];
  this.animationRoot = [];
  return render.drawAllGraph();
};
/**
 * @description Pause animation behavior
 * @return {Undefined} Void
 */


Graph.prototype.pauseAnimation = function () {
  this.attr('animationPause', true);
};
/**
 * @description Try animation behavior
 * @return {Undefined} Void
 */


Graph.prototype.playAnimation = function () {
  var render = this.render;
  this.attr('animationPause', false);
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref4 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(resolve) {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return render.launchAnimation();

            case 2:
              resolve();

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
};
/**
 * @description Processor of delete
 * @param {CRender} render Instance of CRender
 * @return {Undefined} Void
 */


Graph.prototype.delProcessor = function (render) {
  var _this = this;

  var graphs = render.graphs;
  var index = graphs.findIndex(function (graph) {
    return graph === _this;
  });
  if (index === -1) return;
  if (typeof this.beforeDelete === 'function') this.beforeDelete(this);
  graphs.splice(index, 1, null);
  if (typeof this.deleted === 'function') this.deleted(this);
};
/**
 * @description Return a timed release Promise
 * @param {Number} time Release time
 * @return {Promise} A timed release Promise
 */


function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
},{"../plugin/util":8,"./style.class":4,"@babel/runtime/helpers/asyncToGenerator":11,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/toConsumableArray":20,"@babel/runtime/helpers/typeof":21,"@babel/runtime/regenerator":22,"@jiaminghi/transition":29}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _color = require("@jiaminghi/color");

var _util = require("../plugin/util");

var Style = function Style(style) {
  (0, _classCallCheck2["default"])(this, Style);
  this.colorProcessor(style);
  var defaultStyle = {
    /**
     * @description Rgba value of graph fill color
     * @type {Array}
     * @default fill = [0, 0, 0, 1]
     */
    fill: [0, 0, 0, 1],

    /**
     * @description Rgba value of graph stroke color
     * @type {Array}
     * @default stroke = [0, 0, 0, 1]
     */
    stroke: [0, 0, 0, 0],

    /**
     * @description Opacity of graph
     * @type {Number}
     * @default opacity = 1
     */
    opacity: 1,

    /**
     * @description LineCap of Ctx
     * @type {String}
     * @default lineCap = null
     * @example lineCap = 'butt'|'round'|'square'
     */
    lineCap: null,

    /**
     * @description Linejoin of Ctx
     * @type {String}
     * @default lineJoin = null
     * @example lineJoin = 'round'|'bevel'|'miter'
     */
    lineJoin: null,

    /**
     * @description LineDash of Ctx
     * @type {Array}
     * @default lineDash = null
     * @example lineDash = [10, 10]
     */
    lineDash: null,

    /**
     * @description LineDashOffset of Ctx
     * @type {Number}
     * @default lineDashOffset = null
     * @example lineDashOffset = 10
     */
    lineDashOffset: null,

    /**
     * @description ShadowBlur of Ctx
     * @type {Number}
     * @default shadowBlur = 0
     */
    shadowBlur: 0,

    /**
     * @description Rgba value of graph shadow color
     * @type {Array}
     * @default shadowColor = [0, 0, 0, 0]
     */
    shadowColor: [0, 0, 0, 0],

    /**
     * @description ShadowOffsetX of Ctx
     * @type {Number}
     * @default shadowOffsetX = 0
     */
    shadowOffsetX: 0,

    /**
     * @description ShadowOffsetY of Ctx
     * @type {Number}
     * @default shadowOffsetY = 0
     */
    shadowOffsetY: 0,

    /**
     * @description LineWidth of Ctx
     * @type {Number}
     * @default lineWidth = 0
     */
    lineWidth: 0,

    /**
     * @description Center point of the graph
     * @type {Array}
     * @default graphCenter = null
     * @example graphCenter = [10, 10]
     */
    graphCenter: null,

    /**
     * @description Graph scale
     * @type {Array}
     * @default scale = null
     * @example scale = [1.5, 1.5]
     */
    scale: null,

    /**
     * @description Graph rotation degree
     * @type {Number}
     * @default rotate = null
     * @example rotate = 10
     */
    rotate: null,

    /**
     * @description Graph translate distance
     * @type {Array}
     * @default translate = null
     * @example translate = [10, 10]
     */
    translate: null,

    /**
     * @description Cursor status when hover
     * @type {String}
     * @default hoverCursor = 'pointer'
     * @example hoverCursor = 'default'|'pointer'|'auto'|'crosshair'|'move'|'wait'|...
     */
    hoverCursor: 'pointer',

    /**
     * @description Font style of Ctx
     * @type {String}
     * @default fontStyle = 'normal'
     * @example fontStyle = 'normal'|'italic'|'oblique'
     */
    fontStyle: 'normal',

    /**
     * @description Font varient of Ctx
     * @type {String}
     * @default fontVarient = 'normal'
     * @example fontVarient = 'normal'|'small-caps'
     */
    fontVarient: 'normal',

    /**
     * @description Font weight of Ctx
     * @type {String|Number}
     * @default fontWeight = 'normal'
     * @example fontWeight = 'normal'|'bold'|'bolder'|'lighter'|Number
     */
    fontWeight: 'normal',

    /**
     * @description Font size of Ctx
     * @type {Number}
     * @default fontSize = 10
     */
    fontSize: 10,

    /**
     * @description Font family of Ctx
     * @type {String}
     * @default fontFamily = 'Arial'
     */
    fontFamily: 'Arial',

    /**
     * @description TextAlign of Ctx
     * @type {String}
     * @default textAlign = 'center'
     * @example textAlign = 'start'|'end'|'left'|'right'|'center'
     */
    textAlign: 'center',

    /**
     * @description TextBaseline of Ctx
     * @type {String}
     * @default textBaseline = 'middle'
     * @example textBaseline = 'top'|'bottom'|'middle'|'alphabetic'|'hanging'
     */
    textBaseline: 'middle',

    /**
     * @description The color used to create the gradient
     * @type {Array}
     * @default gradientColor = null
     * @example gradientColor = ['#000', '#111', '#222']
     */
    gradientColor: null,

    /**
     * @description Gradient type
     * @type {String}
     * @default gradientType = 'linear'
     * @example gradientType = 'linear' | 'radial'
     */
    gradientType: 'linear',

    /**
     * @description Gradient params
     * @type {Array}
     * @default gradientParams = null
     * @example gradientParams = [x0, y0, x1, y1] (Linear Gradient)
     * @example gradientParams = [x0, y0, r0, x1, y1, r1] (Radial Gradient)
     */
    gradientParams: null,

    /**
     * @description When to use gradients
     * @type {String}
     * @default gradientWith = 'stroke'
     * @example gradientWith = 'stroke' | 'fill'
     */
    gradientWith: 'stroke',

    /**
     * @description Gradient color stops
     * @type {String}
     * @default gradientStops = 'auto'
     * @example gradientStops = 'auto' | [0, .2, .3, 1]
     */
    gradientStops: 'auto',

    /**
     * @description Extended color that supports animation transition
     * @type {Array|Object}
     * @default colors = null
     * @example colors = ['#000', '#111', '#222', 'red' ]
     * @example colors = { a: '#000', b: '#111' }
     */
    colors: null
  };
  Object.assign(this, defaultStyle, style);
};
/**
 * @description Set colors to rgba value
 * @param {Object} style style config
 * @param {Boolean} reverse Whether to perform reverse operation
 * @return {Undefined} Void
 */


exports["default"] = Style;

Style.prototype.colorProcessor = function (style) {
  var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var processor = reverse ? _color.getColorFromRgbValue : _color.getRgbaValue;
  var colorProcessorKeys = ['fill', 'stroke', 'shadowColor'];
  var allKeys = Object.keys(style);
  var colorKeys = allKeys.filter(function (key) {
    return colorProcessorKeys.find(function (k) {
      return k === key;
    });
  });
  colorKeys.forEach(function (key) {
    return style[key] = processor(style[key]);
  });
  var gradientColor = style.gradientColor,
      colors = style.colors;
  if (gradientColor) style.gradientColor = gradientColor.map(function (c) {
    return processor(c);
  });

  if (colors) {
    var colorsKeys = Object.keys(colors);
    colorsKeys.forEach(function (key) {
      return colors[key] = processor(colors[key]);
    });
  }
};
/**
 * @description Init graph style
 * @param {Object} ctx Context of canvas
 * @return {Undefined} Void
 */


Style.prototype.initStyle = function (ctx) {
  initTransform(ctx, this);
  initGraphStyle(ctx, this);
  initGradient(ctx, this);
};
/**
 * @description Init canvas transform
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */


function initTransform(ctx, style) {
  ctx.save();
  var graphCenter = style.graphCenter,
      rotate = style.rotate,
      scale = style.scale,
      translate = style.translate;
  if (!(graphCenter instanceof Array)) return;
  ctx.translate.apply(ctx, (0, _toConsumableArray2["default"])(graphCenter));
  if (rotate) ctx.rotate(rotate * Math.PI / 180);
  if (scale instanceof Array) ctx.scale.apply(ctx, (0, _toConsumableArray2["default"])(scale));
  if (translate) ctx.translate.apply(ctx, (0, _toConsumableArray2["default"])(translate));
  ctx.translate(-graphCenter[0], -graphCenter[1]);
}

var autoSetStyleKeys = ['lineCap', 'lineJoin', 'lineDashOffset', 'shadowOffsetX', 'shadowOffsetY', 'lineWidth', 'textAlign', 'textBaseline'];
/**
 * @description Set the style of canvas ctx
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */

function initGraphStyle(ctx, style) {
  var fill = style.fill,
      stroke = style.stroke,
      shadowColor = style.shadowColor,
      opacity = style.opacity;
  autoSetStyleKeys.forEach(function (key) {
    if (key || typeof key === 'number') ctx[key] = style[key];
  });
  fill = (0, _toConsumableArray2["default"])(fill);
  stroke = (0, _toConsumableArray2["default"])(stroke);
  shadowColor = (0, _toConsumableArray2["default"])(shadowColor);
  fill[3] *= opacity;
  stroke[3] *= opacity;
  shadowColor[3] *= opacity;
  ctx.fillStyle = (0, _color.getColorFromRgbValue)(fill);
  ctx.strokeStyle = (0, _color.getColorFromRgbValue)(stroke);
  ctx.shadowColor = (0, _color.getColorFromRgbValue)(shadowColor);
  var lineDash = style.lineDash,
      shadowBlur = style.shadowBlur;

  if (lineDash) {
    lineDash = lineDash.map(function (v) {
      return v >= 0 ? v : 0;
    });
    ctx.setLineDash(lineDash);
  }

  if (typeof shadowBlur === 'number') ctx.shadowBlur = shadowBlur > 0 ? shadowBlur : 0.001;
  var fontStyle = style.fontStyle,
      fontVarient = style.fontVarient,
      fontWeight = style.fontWeight,
      fontSize = style.fontSize,
      fontFamily = style.fontFamily;
  ctx.font = fontStyle + ' ' + fontVarient + ' ' + fontWeight + ' ' + fontSize + 'px' + ' ' + fontFamily;
}
/**
 * @description Set the gradient color of canvas ctx
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */


function initGradient(ctx, style) {
  if (!gradientValidator(style)) return;
  var gradientColor = style.gradientColor,
      gradientParams = style.gradientParams,
      gradientType = style.gradientType,
      gradientWith = style.gradientWith,
      gradientStops = style.gradientStops,
      opacity = style.opacity;
  gradientColor = gradientColor.map(function (color) {
    var colorOpacity = color[3] * opacity;
    var clonedColor = (0, _toConsumableArray2["default"])(color);
    clonedColor[3] = colorOpacity;
    return clonedColor;
  });
  gradientColor = gradientColor.map(function (c) {
    return (0, _color.getColorFromRgbValue)(c);
  });
  if (gradientStops === 'auto') gradientStops = getAutoColorStops(gradientColor);
  var gradient = ctx["create".concat(gradientType.slice(0, 1).toUpperCase() + gradientType.slice(1), "Gradient")].apply(ctx, (0, _toConsumableArray2["default"])(gradientParams));
  gradientStops.forEach(function (stop, i) {
    return gradient.addColorStop(stop, gradientColor[i]);
  });
  ctx["".concat(gradientWith, "Style")] = gradient;
}
/**
 * @description Check if the gradient configuration is legal
 * @param {Style} style Instance of Style
 * @return {Boolean} Check Result
 */


function gradientValidator(style) {
  var gradientColor = style.gradientColor,
      gradientParams = style.gradientParams,
      gradientType = style.gradientType,
      gradientWith = style.gradientWith,
      gradientStops = style.gradientStops;
  if (!gradientColor || !gradientParams) return false;

  if (gradientColor.length === 1) {
    console.warn('The gradient needs to provide at least two colors');
    return false;
  }

  if (gradientType !== 'linear' && gradientType !== 'radial') {
    console.warn('GradientType only supports linear or radial, current value is ' + gradientType);
    return false;
  }

  var gradientParamsLength = gradientParams.length;

  if (gradientType === 'linear' && gradientParamsLength !== 4 || gradientType === 'radial' && gradientParamsLength !== 6) {
    console.warn('The expected length of gradientParams is ' + (gradientType === 'linear' ? '4' : '6'));
    return false;
  }

  if (gradientWith !== 'fill' && gradientWith !== 'stroke') {
    console.warn('GradientWith only supports fill or stroke, current value is ' + gradientWith);
    return false;
  }

  if (gradientStops !== 'auto' && !(gradientStops instanceof Array)) {
    console.warn("gradientStops only supports 'auto' or Number Array ([0, .5, 1]), current value is " + gradientStops);
    return false;
  }

  return true;
}
/**
 * @description Get a uniform gradient color stop
 * @param {Array} color Gradient color
 * @return {Array} Gradient color stop
 */


function getAutoColorStops(color) {
  var stopGap = 1 / (color.length - 1);
  return color.map(function (foo, i) {
    return stopGap * i;
  });
}
/**
 * @description Restore canvas ctx transform
 * @param {Object} ctx  Context of canvas
 * @return {Undefined} Void
 */


Style.prototype.restoreTransform = function (ctx) {
  ctx.restore();
};
/**
 * @description Update style data
 * @param {Object} change Changed data
 * @return {Undefined} Void
 */


Style.prototype.update = function (change) {
  this.colorProcessor(change);
  Object.assign(this, change);
};
/**
 * @description Get the current style configuration
 * @return {Object} Style configuration
 */


Style.prototype.getStyle = function () {
  var clonedStyle = (0, _util.deepClone)(this, true);
  this.colorProcessor(clonedStyle, true);
  return clonedStyle;
};
},{"../plugin/util":8,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/toConsumableArray":20,"@jiaminghi/color":27}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendNewGraph = extendNewGraph;
exports["default"] = exports.text = exports.bezierCurve = exports.smoothline = exports.polyline = exports.regPolygon = exports.sector = exports.arc = exports.ring = exports.rect = exports.ellipse = exports.circle = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _bezierCurve2 = _interopRequireDefault(require("@jiaminghi/bezier-curve"));

var _util = require("../plugin/util");

var _canvas = require("../plugin/canvas");

var polylineToBezierCurve = _bezierCurve2["default"].polylineToBezierCurve,
    bezierCurveToPolyline = _bezierCurve2["default"].bezierCurveToPolyline;
var circle = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0
  },
  validator: function validator(_ref) {
    var shape = _ref.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof r !== 'number') {
      console.error('Circle shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref2, _ref3) {
    var ctx = _ref2.ctx;
    var shape = _ref3.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref4) {
    var shape = _ref4.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    return (0, _util.checkPointIsInCircle)(position, rx, ry, r);
  },
  setGraphCenter: function setGraphCenter(e, _ref5) {
    var shape = _ref5.shape,
        style = _ref5.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref6, _ref7) {
    var movementX = _ref6.movementX,
        movementY = _ref6.movementY;
    var shape = _ref7.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.circle = circle;
var ellipse = {
  shape: {
    rx: 0,
    ry: 0,
    hr: 0,
    vr: 0
  },
  validator: function validator(_ref8) {
    var shape = _ref8.shape;
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof hr !== 'number' || typeof vr !== 'number') {
      console.error('Ellipse shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref9, _ref10) {
    var ctx = _ref9.ctx;
    var shape = _ref10.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;
    ctx.ellipse(rx, ry, hr > 0 ? hr : 0.01, vr > 0 ? vr : 0.01, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref11) {
    var shape = _ref11.shape;
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;
    var a = Math.max(hr, vr);
    var b = Math.min(hr, vr);
    var c = Math.sqrt(a * a - b * b);
    var leftFocusPoint = [rx - c, ry];
    var rightFocusPoint = [rx + c, ry];
    var distance = (0, _util.getTwoPointDistance)(position, leftFocusPoint) + (0, _util.getTwoPointDistance)(position, rightFocusPoint);
    return distance <= 2 * a;
  },
  setGraphCenter: function setGraphCenter(e, _ref12) {
    var shape = _ref12.shape,
        style = _ref12.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref13, _ref14) {
    var movementX = _ref13.movementX,
        movementY = _ref13.movementY;
    var shape = _ref14.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.ellipse = ellipse;
var rect = {
  shape: {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  },
  validator: function validator(_ref15) {
    var shape = _ref15.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof w !== 'number' || typeof h !== 'number') {
      console.error('Rect shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref16, _ref17) {
    var ctx = _ref16.ctx;
    var shape = _ref17.shape;
    ctx.beginPath();
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref18) {
    var shape = _ref18.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    return (0, _util.checkPointIsInRect)(position, x, y, w, h);
  },
  setGraphCenter: function setGraphCenter(e, _ref19) {
    var shape = _ref19.shape,
        style = _ref19.style;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    style.graphCenter = [x + w / 2, y + h / 2];
  },
  move: function move(_ref20, _ref21) {
    var movementX = _ref20.movementX,
        movementY = _ref20.movementY;
    var shape = _ref21.shape;
    this.attr('shape', {
      x: shape.x + movementX,
      y: shape.y + movementY
    });
  }
};
exports.rect = rect;
var ring = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0
  },
  validator: function validator(_ref22) {
    var shape = _ref22.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof r !== 'number') {
      console.error('Ring shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref23, _ref24) {
    var ctx = _ref23.ctx;
    var shape = _ref24.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref25) {
    var shape = _ref25.shape,
        style = _ref25.style;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    var lineWidth = style.lineWidth;
    var halfLineWidth = lineWidth / 2;
    var minDistance = r - halfLineWidth;
    var maxDistance = r + halfLineWidth;
    var distance = (0, _util.getTwoPointDistance)(position, [rx, ry]);
    return distance >= minDistance && distance <= maxDistance;
  },
  setGraphCenter: function setGraphCenter(e, _ref26) {
    var shape = _ref26.shape,
        style = _ref26.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref27, _ref28) {
    var movementX = _ref27.movementX,
        movementY = _ref27.movementY;
    var shape = _ref28.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.ring = ring;
var arc = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },
  validator: function validator(_ref29) {
    var shape = _ref29.shape;
    var keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('Arc shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref30, _ref31) {
    var ctx = _ref30.ctx;
    var shape = _ref31.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    ctx.arc(rx, ry, r > 0 ? r : 0.001, startAngle, endAngle, !clockWise);
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref32) {
    var shape = _ref32.shape,
        style = _ref32.style;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    var lineWidth = style.lineWidth;
    var halfLineWidth = lineWidth / 2;
    var insideRadius = r - halfLineWidth;
    var outsideRadius = r + halfLineWidth;
    return !(0, _util.checkPointIsInSector)(position, rx, ry, insideRadius, startAngle, endAngle, clockWise) && (0, _util.checkPointIsInSector)(position, rx, ry, outsideRadius, startAngle, endAngle, clockWise);
  },
  setGraphCenter: function setGraphCenter(e, _ref33) {
    var shape = _ref33.shape,
        style = _ref33.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref34, _ref35) {
    var movementX = _ref34.movementX,
        movementY = _ref34.movementY;
    var shape = _ref35.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.arc = arc;
var sector = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },
  validator: function validator(_ref36) {
    var shape = _ref36.shape;
    var keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('Sector shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref37, _ref38) {
    var ctx = _ref37.ctx;
    var shape = _ref38.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, startAngle, endAngle, !clockWise);
    ctx.lineTo(rx, ry);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  },
  hoverCheck: function hoverCheck(position, _ref39) {
    var shape = _ref39.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    return (0, _util.checkPointIsInSector)(position, rx, ry, r, startAngle, endAngle, clockWise);
  },
  setGraphCenter: function setGraphCenter(e, _ref40) {
    var shape = _ref40.shape,
        style = _ref40.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref41, _ref42) {
    var movementX = _ref41.movementX,
        movementY = _ref41.movementY;
    var shape = _ref42.shape;
    var rx = shape.rx,
        ry = shape.ry;
    this.attr('shape', {
      rx: rx + movementX,
      ry: ry + movementY
    });
  }
};
exports.sector = sector;
var regPolygon = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    side: 0
  },
  validator: function validator(_ref43) {
    var shape = _ref43.shape;
    var side = shape.side;
    var keys = ['rx', 'ry', 'r', 'side'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('RegPolygon shape configuration is abnormal!');
      return false;
    }

    if (side < 3) {
      console.error('RegPolygon at least trigon!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref44, _ref45) {
    var ctx = _ref44.ctx;
    var shape = _ref45.shape,
        cache = _ref45.cache;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        side = shape.side;

    if (!cache.points || cache.rx !== rx || cache.ry !== ry || cache.r !== r || cache.side !== side) {
      var _points = (0, _util.getRegularPolygonPoints)(rx, ry, r, side);

      Object.assign(cache, {
        points: _points,
        rx: rx,
        ry: ry,
        r: r,
        side: side
      });
    }

    var points = cache.points;
    (0, _canvas.drawPolylinePath)(ctx, points);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  },
  hoverCheck: function hoverCheck(position, _ref46) {
    var cache = _ref46.cache;
    var points = cache.points;
    return (0, _util.checkPointIsInPolygon)(position, points);
  },
  setGraphCenter: function setGraphCenter(e, _ref47) {
    var shape = _ref47.shape,
        style = _ref47.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref48, _ref49) {
    var movementX = _ref48.movementX,
        movementY = _ref48.movementY;
    var shape = _ref49.shape,
        cache = _ref49.cache;
    var rx = shape.rx,
        ry = shape.ry;
    cache.rx += movementX;
    cache.ry += movementY;
    this.attr('shape', {
      rx: rx + movementX,
      ry: ry + movementY
    });
    cache.points = cache.points.map(function (_ref50) {
      var _ref51 = (0, _slicedToArray2["default"])(_ref50, 2),
          x = _ref51[0],
          y = _ref51[1];

      return [x + movementX, y + movementY];
    });
  }
};
exports.regPolygon = regPolygon;
var polyline = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref52) {
    var shape = _ref52.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('Polyline points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref53, _ref54) {
    var ctx = _ref53.ctx;
    var shape = _ref54.shape,
        lineWidth = _ref54.style.lineWidth;
    ctx.beginPath();
    var points = shape.points,
        close = shape.close;
    if (lineWidth === 1) points = (0, _util.eliminateBlur)(points);
    (0, _canvas.drawPolylinePath)(ctx, points);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref55) {
    var shape = _ref55.shape,
        style = _ref55.style;
    var points = shape.points,
        close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, points);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, points, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref56) {
    var shape = _ref56.shape,
        style = _ref56.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref57, _ref58) {
    var movementX = _ref57.movementX,
        movementY = _ref57.movementY;
    var shape = _ref58.shape;
    var points = shape.points;
    var moveAfterPoints = points.map(function (_ref59) {
      var _ref60 = (0, _slicedToArray2["default"])(_ref59, 2),
          x = _ref60[0],
          y = _ref60[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: moveAfterPoints
    });
  }
};
exports.polyline = polyline;
var smoothline = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref61) {
    var shape = _ref61.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('Smoothline points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref62, _ref63) {
    var ctx = _ref62.ctx;
    var shape = _ref63.shape,
        cache = _ref63.cache;
    var points = shape.points,
        close = shape.close;

    if (!cache.points || cache.points.toString() !== points.toString()) {
      var _bezierCurve = polylineToBezierCurve(points, close);

      var hoverPoints = bezierCurveToPolyline(_bezierCurve);
      Object.assign(cache, {
        points: (0, _util.deepClone)(points, true),
        bezierCurve: _bezierCurve,
        hoverPoints: hoverPoints
      });
    }

    var bezierCurve = cache.bezierCurve;
    ctx.beginPath();
    (0, _canvas.drawBezierCurvePath)(ctx, bezierCurve.slice(1), bezierCurve[0]);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref64) {
    var cache = _ref64.cache,
        shape = _ref64.shape,
        style = _ref64.style;
    var hoverPoints = cache.hoverPoints;
    var close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, hoverPoints);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, hoverPoints, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref65) {
    var shape = _ref65.shape,
        style = _ref65.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref66, _ref67) {
    var movementX = _ref66.movementX,
        movementY = _ref66.movementY;
    var shape = _ref67.shape,
        cache = _ref67.cache;
    var points = shape.points;
    var moveAfterPoints = points.map(function (_ref68) {
      var _ref69 = (0, _slicedToArray2["default"])(_ref68, 2),
          x = _ref69[0],
          y = _ref69[1];

      return [x + movementX, y + movementY];
    });
    cache.points = moveAfterPoints;

    var _cache$bezierCurve$ = (0, _slicedToArray2["default"])(cache.bezierCurve[0], 2),
        fx = _cache$bezierCurve$[0],
        fy = _cache$bezierCurve$[1];

    var curves = cache.bezierCurve.slice(1);
    cache.bezierCurve = [[fx + movementX, fy + movementY]].concat((0, _toConsumableArray2["default"])(curves.map(function (curve) {
      return curve.map(function (_ref70) {
        var _ref71 = (0, _slicedToArray2["default"])(_ref70, 2),
            x = _ref71[0],
            y = _ref71[1];

        return [x + movementX, y + movementY];
      });
    })));
    cache.hoverPoints = cache.hoverPoints.map(function (_ref72) {
      var _ref73 = (0, _slicedToArray2["default"])(_ref72, 2),
          x = _ref73[0],
          y = _ref73[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: moveAfterPoints
    });
  }
};
exports.smoothline = smoothline;
var bezierCurve = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref74) {
    var shape = _ref74.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('BezierCurve points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref75, _ref76) {
    var ctx = _ref75.ctx;
    var shape = _ref76.shape,
        cache = _ref76.cache;
    var points = shape.points,
        close = shape.close;

    if (!cache.points || cache.points.toString() !== points.toString()) {
      var hoverPoints = bezierCurveToPolyline(points, 20);
      Object.assign(cache, {
        points: (0, _util.deepClone)(points, true),
        hoverPoints: hoverPoints
      });
    }

    ctx.beginPath();
    (0, _canvas.drawBezierCurvePath)(ctx, points.slice(1), points[0]);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref77) {
    var cache = _ref77.cache,
        shape = _ref77.shape,
        style = _ref77.style;
    var hoverPoints = cache.hoverPoints;
    var close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, hoverPoints);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, hoverPoints, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref78) {
    var shape = _ref78.shape,
        style = _ref78.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref79, _ref80) {
    var movementX = _ref79.movementX,
        movementY = _ref79.movementY;
    var shape = _ref80.shape,
        cache = _ref80.cache;
    var points = shape.points;

    var _points$ = (0, _slicedToArray2["default"])(points[0], 2),
        fx = _points$[0],
        fy = _points$[1];

    var curves = points.slice(1);
    var bezierCurve = [[fx + movementX, fy + movementY]].concat((0, _toConsumableArray2["default"])(curves.map(function (curve) {
      return curve.map(function (_ref81) {
        var _ref82 = (0, _slicedToArray2["default"])(_ref81, 2),
            x = _ref82[0],
            y = _ref82[1];

        return [x + movementX, y + movementY];
      });
    })));
    cache.points = bezierCurve;
    cache.hoverPoints = cache.hoverPoints.map(function (_ref83) {
      var _ref84 = (0, _slicedToArray2["default"])(_ref83, 2),
          x = _ref84[0],
          y = _ref84[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: bezierCurve
    });
  }
};
exports.bezierCurve = bezierCurve;
var text = {
  shape: {
    content: '',
    position: [],
    maxWidth: undefined,
    rowGap: 0
  },
  validator: function validator(_ref85) {
    var shape = _ref85.shape;
    var content = shape.content,
        position = shape.position,
        rowGap = shape.rowGap;

    if (typeof content !== 'string') {
      console.error('Text content should be a string!');
      return false;
    }

    if (!(position instanceof Array)) {
      console.error('Text position should be an array!');
      return false;
    }

    if (typeof rowGap !== 'number') {
      console.error('Text rowGap should be a number!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref86, _ref87) {
    var ctx = _ref86.ctx;
    var shape = _ref87.shape;
    var content = shape.content,
        position = shape.position,
        maxWidth = shape.maxWidth,
        rowGap = shape.rowGap;
    var textBaseline = ctx.textBaseline,
        font = ctx.font;
    var fontSize = parseInt(font.replace(/\D/g, ''));

    var _position = position,
        _position2 = (0, _slicedToArray2["default"])(_position, 2),
        x = _position2[0],
        y = _position2[1];

    content = content.split('\n');
    var rowNum = content.length;
    var lineHeight = fontSize + rowGap;
    var allHeight = rowNum * lineHeight - rowGap;
    var offset = 0;

    if (textBaseline === 'middle') {
      offset = allHeight / 2;
      y += fontSize / 2;
    }

    if (textBaseline === 'bottom') {
      offset = allHeight;
      y += fontSize;
    }

    position = new Array(rowNum).fill(0).map(function (foo, i) {
      return [x, y + i * lineHeight - offset];
    });
    ctx.beginPath();
    content.forEach(function (text, i) {
      ctx.fillText.apply(ctx, [text].concat((0, _toConsumableArray2["default"])(position[i]), [maxWidth]));
      ctx.strokeText.apply(ctx, [text].concat((0, _toConsumableArray2["default"])(position[i]), [maxWidth]));
    });
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref88) {
    var shape = _ref88.shape,
        style = _ref88.style;
    return false;
  },
  setGraphCenter: function setGraphCenter(e, _ref89) {
    var shape = _ref89.shape,
        style = _ref89.style;
    var position = shape.position;
    style.graphCenter = (0, _toConsumableArray2["default"])(position);
  },
  move: function move(_ref90, _ref91) {
    var movementX = _ref90.movementX,
        movementY = _ref90.movementY;
    var shape = _ref91.shape;

    var _shape$position = (0, _slicedToArray2["default"])(shape.position, 2),
        x = _shape$position[0],
        y = _shape$position[1];

    this.attr('shape', {
      position: [x + movementX, y + movementY]
    });
  }
};
exports.text = text;
var graphs = new Map([['circle', circle], ['ellipse', ellipse], ['rect', rect], ['ring', ring], ['arc', arc], ['sector', sector], ['regPolygon', regPolygon], ['polyline', polyline], ['smoothline', smoothline], ['bezierCurve', bezierCurve], ['text', text]]);
var _default = graphs;
/**
 * @description Extend new graph
 * @param {String} name   Name of Graph
 * @param {Object} config Configuration of Graph
 * @return {Undefined} Void
 */

exports["default"] = _default;

function extendNewGraph(name, config) {
  if (!name || !config) {
    console.error('ExtendNewGraph Missing Parameters!');
    return;
  }

  if (!config.shape) {
    console.error('Required attribute of shape to extendNewGraph!');
    return;
  }

  if (!config.validator) {
    console.error('Required function of validator to extendNewGraph!');
    return;
  }

  if (!config.draw) {
    console.error('Required function of draw to extendNewGraph!');
    return;
  }

  graphs.set(name, config);
}
},{"../plugin/canvas":7,"../plugin/util":8,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/slicedToArray":19,"@babel/runtime/helpers/toConsumableArray":20,"@jiaminghi/bezier-curve":25}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CRender", {
  enumerable: true,
  get: function get() {
    return _crender["default"];
  }
});
Object.defineProperty(exports, "extendNewGraph", {
  enumerable: true,
  get: function get() {
    return _graphs.extendNewGraph;
  }
});
exports["default"] = void 0;

var _crender = _interopRequireDefault(require("./class/crender.class"));

var _graphs = require("./config/graphs");

var _default = _crender["default"];
exports["default"] = _default;
},{"./class/crender.class":2,"./config/graphs":5,"@babel/runtime/helpers/interopRequireDefault":14}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawPolylinePath = drawPolylinePath;
exports.drawBezierCurvePath = drawBezierCurvePath;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

/**
 * @description Draw a polyline path
 * @param {Object} ctx        Canvas 2d context
 * @param {Array} points      The points that makes up a polyline
 * @param {Boolean} beginPath Whether to execute beginPath
 * @param {Boolean} closePath Whether to execute closePath
 * @return {Undefined} Void
 */
function drawPolylinePath(ctx, points) {
  var beginPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var closePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!ctx || points.length < 2) return false;
  if (beginPath) ctx.beginPath();
  points.forEach(function (point, i) {
    return point && (i === 0 ? ctx.moveTo.apply(ctx, (0, _toConsumableArray2["default"])(point)) : ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(point)));
  });
  if (closePath) ctx.closePath();
}
/**
 * @description Draw a bezier curve path
 * @param {Object} ctx        Canvas 2d context
 * @param {Array} points      The points that makes up a bezier curve
 * @param {Array} moveTo      The point need to excute moveTo
 * @param {Boolean} beginPath Whether to execute beginPath
 * @param {Boolean} closePath Whether to execute closePath
 * @return {Undefined} Void
 */


function drawBezierCurvePath(ctx, points) {
  var moveTo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var beginPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var closePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  if (!ctx || !points) return false;
  if (beginPath) ctx.beginPath();
  if (moveTo) ctx.moveTo.apply(ctx, (0, _toConsumableArray2["default"])(moveTo));
  points.forEach(function (item) {
    return item && ctx.bezierCurveTo.apply(ctx, (0, _toConsumableArray2["default"])(item[0]).concat((0, _toConsumableArray2["default"])(item[1]), (0, _toConsumableArray2["default"])(item[2])));
  });
  if (closePath) ctx.closePath();
}

var _default = {
  drawPolylinePath: drawPolylinePath,
  drawBezierCurvePath: drawBezierCurvePath
};
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/toConsumableArray":20}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepClone = deepClone;
exports.eliminateBlur = eliminateBlur;
exports.checkPointIsInCircle = checkPointIsInCircle;
exports.getTwoPointDistance = getTwoPointDistance;
exports.checkPointIsInPolygon = checkPointIsInPolygon;
exports.checkPointIsInSector = checkPointIsInSector;
exports.checkPointIsNearPolyline = checkPointIsNearPolyline;
exports.checkPointIsInRect = checkPointIsInRect;
exports.getRotatePointPos = getRotatePointPos;
exports.getScalePointPos = getScalePointPos;
exports.getTranslatePointPos = getTranslatePointPos;
exports.getDistanceBetweenPointAndLine = getDistanceBetweenPointAndLine;
exports.getCircleRadianPoint = getCircleRadianPoint;
exports.getRegularPolygonPoints = getRegularPolygonPoints;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var abs = Math.abs,
    sqrt = Math.sqrt,
    sin = Math.sin,
    cos = Math.cos,
    max = Math.max,
    min = Math.min,
    PI = Math.PI;
/**
 * @description Clone an object or array
 * @param {Object|Array} object Cloned object
 * @param {Boolean} recursion   Whether to use recursive cloning
 * @return {Object|Array} Clone object
 */

function deepClone(object) {
  var recursion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!object) return object;
  var parse = JSON.parse,
      stringify = JSON.stringify;
  if (!recursion) return parse(stringify(object));
  var clonedObj = object instanceof Array ? [] : {};

  if (object && (0, _typeof2["default"])(object) === 'object') {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (object[key] && (0, _typeof2["default"])(object[key]) === 'object') {
          clonedObj[key] = deepClone(object[key], true);
        } else {
          clonedObj[key] = object[key];
        }
      }
    }
  }

  return clonedObj;
}
/**
 * @description Eliminate line blur due to 1px line width
 * @param {Array} points Line points
 * @return {Array} Line points after processed
 */


function eliminateBlur(points) {
  return points.map(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

    return [parseInt(x) + 0.5, parseInt(y) + 0.5];
  });
}
/**
 * @description Check if the point is inside the circle
 * @param {Array} point Postion of point
 * @param {Number} rx   Circle x coordinate
 * @param {Number} ry   Circle y coordinate
 * @param {Number} r    Circle radius
 * @return {Boolean} Result of check
 */


function checkPointIsInCircle(point, rx, ry, r) {
  return getTwoPointDistance(point, [rx, ry]) <= r;
}
/**
 * @description Get the distance between two points
 * @param {Array} point1 point1
 * @param {Array} point2 point2
 * @return {Number} Distance between two points
 */


function getTwoPointDistance(_ref3, _ref4) {
  var _ref5 = (0, _slicedToArray2["default"])(_ref3, 2),
      xa = _ref5[0],
      ya = _ref5[1];

  var _ref6 = (0, _slicedToArray2["default"])(_ref4, 2),
      xb = _ref6[0],
      yb = _ref6[1];

  var minusX = abs(xa - xb);
  var minusY = abs(ya - yb);
  return sqrt(minusX * minusX + minusY * minusY);
}
/**
 * @description Check if the point is inside the polygon
 * @param {Array} point  Postion of point
 * @param {Array} points The points that makes up a polyline
 * @return {Boolean} Result of check
 */


function checkPointIsInPolygon(point, polygon) {
  var counter = 0;

  var _point = (0, _slicedToArray2["default"])(point, 2),
      x = _point[0],
      y = _point[1];

  var pointNum = polygon.length;

  for (var i = 1, p1 = polygon[0]; i <= pointNum; i++) {
    var p2 = polygon[i % pointNum];

    if (x > min(p1[0], p2[0]) && x <= max(p1[0], p2[0])) {
      if (y <= max(p1[1], p2[1])) {
        if (p1[0] !== p2[0]) {
          var xinters = (x - p1[0]) * (p2[1] - p1[1]) / (p2[0] - p1[0]) + p1[1];

          if (p1[1] === p2[1] || y <= xinters) {
            counter++;
          }
        }
      }
    }

    p1 = p2;
  }

  return counter % 2 === 1;
}
/**
 * @description Check if the point is inside the sector
 * @param {Array} point       Postion of point
 * @param {Number} rx         Sector x coordinate
 * @param {Number} ry         Sector y coordinate
 * @param {Number} r          Sector radius
 * @param {Number} startAngle Sector start angle
 * @param {Number} endAngle   Sector end angle
 * @param {Boolean} clockWise Whether the sector angle is clockwise
 * @return {Boolean} Result of check
 */


function checkPointIsInSector(point, rx, ry, r, startAngle, endAngle, clockWise) {
  if (!point) return false;
  if (getTwoPointDistance(point, [rx, ry]) > r) return false;

  if (!clockWise) {
    var _deepClone = deepClone([endAngle, startAngle]);

    var _deepClone2 = (0, _slicedToArray2["default"])(_deepClone, 2);

    startAngle = _deepClone2[0];
    endAngle = _deepClone2[1];
  }

  var reverseBE = startAngle > endAngle;

  if (reverseBE) {
    var _ref7 = [endAngle, startAngle];
    startAngle = _ref7[0];
    endAngle = _ref7[1];
  }

  var minus = endAngle - startAngle;
  if (minus >= PI * 2) return true;

  var _point2 = (0, _slicedToArray2["default"])(point, 2),
      x = _point2[0],
      y = _point2[1];

  var _getCircleRadianPoint = getCircleRadianPoint(rx, ry, r, startAngle),
      _getCircleRadianPoint2 = (0, _slicedToArray2["default"])(_getCircleRadianPoint, 2),
      bx = _getCircleRadianPoint2[0],
      by = _getCircleRadianPoint2[1];

  var _getCircleRadianPoint3 = getCircleRadianPoint(rx, ry, r, endAngle),
      _getCircleRadianPoint4 = (0, _slicedToArray2["default"])(_getCircleRadianPoint3, 2),
      ex = _getCircleRadianPoint4[0],
      ey = _getCircleRadianPoint4[1];

  var vPoint = [x - rx, y - ry];
  var vBArm = [bx - rx, by - ry];
  var vEArm = [ex - rx, ey - ry];
  var reverse = minus > PI;

  if (reverse) {
    var _deepClone3 = deepClone([vEArm, vBArm]);

    var _deepClone4 = (0, _slicedToArray2["default"])(_deepClone3, 2);

    vBArm = _deepClone4[0];
    vEArm = _deepClone4[1];
  }

  var inSector = isClockWise(vBArm, vPoint) && !isClockWise(vEArm, vPoint);
  if (reverse) inSector = !inSector;
  if (reverseBE) inSector = !inSector;
  return inSector;
}
/**
 * @description Determine if the point is in the clockwise direction of the vector
 * @param {Array} vArm   Vector
 * @param {Array} vPoint Point
 * @return {Boolean} Result of check
 */


function isClockWise(vArm, vPoint) {
  var _vArm = (0, _slicedToArray2["default"])(vArm, 2),
      ax = _vArm[0],
      ay = _vArm[1];

  var _vPoint = (0, _slicedToArray2["default"])(vPoint, 2),
      px = _vPoint[0],
      py = _vPoint[1];

  return -ay * px + ax * py > 0;
}
/**
 * @description Check if the point is inside the polyline
 * @param {Array} point      Postion of point
 * @param {Array} polyline   The points that makes up a polyline
 * @param {Number} lineWidth Polyline linewidth
 * @return {Boolean} Result of check
 */


function checkPointIsNearPolyline(point, polyline, lineWidth) {
  var halfLineWidth = lineWidth / 2;
  var moveUpPolyline = polyline.map(function (_ref8) {
    var _ref9 = (0, _slicedToArray2["default"])(_ref8, 2),
        x = _ref9[0],
        y = _ref9[1];

    return [x, y - halfLineWidth];
  });
  var moveDownPolyline = polyline.map(function (_ref10) {
    var _ref11 = (0, _slicedToArray2["default"])(_ref10, 2),
        x = _ref11[0],
        y = _ref11[1];

    return [x, y + halfLineWidth];
  });
  var polygon = [].concat((0, _toConsumableArray2["default"])(moveUpPolyline), (0, _toConsumableArray2["default"])(moveDownPolyline.reverse()));
  return checkPointIsInPolygon(point, polygon);
}
/**
 * @description Check if the point is inside the rect
 * @param {Array} point   Postion of point
 * @param {Number} x      Rect start x coordinate
 * @param {Number} y      Rect start y coordinate
 * @param {Number} width  Rect width
 * @param {Number} height Rect height
 * @return {Boolean} Result of check
 */


function checkPointIsInRect(_ref12, x, y, width, height) {
  var _ref13 = (0, _slicedToArray2["default"])(_ref12, 2),
      px = _ref13[0],
      py = _ref13[1];

  if (px < x) return false;
  if (py < y) return false;
  if (px > x + width) return false;
  if (py > y + height) return false;
  return true;
}
/**
 * @description Get the coordinates of the rotated point
 * @param {Number} rotate Degree of rotation
 * @param {Array} point   Postion of point
 * @param {Array} origin  Rotation center
 * @param {Array} origin  Rotation center
 * @return {Number} Coordinates after rotation
 */


function getRotatePointPos() {
  var rotate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var point = arguments.length > 1 ? arguments[1] : undefined;
  var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
  if (!point) return false;
  if (rotate % 360 === 0) return point;

  var _point3 = (0, _slicedToArray2["default"])(point, 2),
      x = _point3[0],
      y = _point3[1];

  var _origin = (0, _slicedToArray2["default"])(origin, 2),
      ox = _origin[0],
      oy = _origin[1];

  rotate *= PI / 180;
  return [(x - ox) * cos(rotate) - (y - oy) * sin(rotate) + ox, (x - ox) * sin(rotate) + (y - oy) * cos(rotate) + oy];
}
/**
 * @description Get the coordinates of the scaled point
 * @param {Array} scale  Scale factor
 * @param {Array} point  Postion of point
 * @param {Array} origin Scale center
 * @return {Number} Coordinates after scale
 */


function getScalePointPos() {
  var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 1];
  var point = arguments.length > 1 ? arguments[1] : undefined;
  var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
  if (!point) return false;
  if (scale === 1) return point;

  var _point4 = (0, _slicedToArray2["default"])(point, 2),
      x = _point4[0],
      y = _point4[1];

  var _origin2 = (0, _slicedToArray2["default"])(origin, 2),
      ox = _origin2[0],
      oy = _origin2[1];

  var _scale = (0, _slicedToArray2["default"])(scale, 2),
      xs = _scale[0],
      ys = _scale[1];

  var relativePosX = x - ox;
  var relativePosY = y - oy;
  return [relativePosX * xs + ox, relativePosY * ys + oy];
}
/**
 * @description Get the coordinates of the scaled point
 * @param {Array} translate Translation distance
 * @param {Array} point     Postion of point
 * @return {Number} Coordinates after translation
 */


function getTranslatePointPos(translate, point) {
  if (!translate || !point) return false;

  var _point5 = (0, _slicedToArray2["default"])(point, 2),
      x = _point5[0],
      y = _point5[1];

  var _translate = (0, _slicedToArray2["default"])(translate, 2),
      tx = _translate[0],
      ty = _translate[1];

  return [x + tx, y + ty];
}
/**
 * @description Get the distance from the point to the line
 * @param {Array} point     Postion of point
 * @param {Array} lineBegin Line start position
 * @param {Array} lineEnd   Line end position
 * @return {Number} Distance between point and line
 */


function getDistanceBetweenPointAndLine(point, lineBegin, lineEnd) {
  if (!point || !lineBegin || !lineEnd) return false;

  var _point6 = (0, _slicedToArray2["default"])(point, 2),
      x = _point6[0],
      y = _point6[1];

  var _lineBegin = (0, _slicedToArray2["default"])(lineBegin, 2),
      x1 = _lineBegin[0],
      y1 = _lineBegin[1];

  var _lineEnd = (0, _slicedToArray2["default"])(lineEnd, 2),
      x2 = _lineEnd[0],
      y2 = _lineEnd[1];

  var a = y2 - y1;
  var b = x1 - x2;
  var c = y1 * (x2 - x1) - x1 * (y2 - y1);
  var molecule = abs(a * x + b * y + c);
  var denominator = sqrt(a * a + b * b);
  return molecule / denominator;
}
/**
 * @description Get the coordinates of the specified radian on the circle
 * @param {Number} x      Circle x coordinate
 * @param {Number} y      Circle y coordinate
 * @param {Number} radius Circle radius
 * @param {Number} radian Specfied radian
 * @return {Array} Postion of point
 */


function getCircleRadianPoint(x, y, radius, radian) {
  return [x + cos(radian) * radius, y + sin(radian) * radius];
}
/**
 * @description Get the points that make up a regular polygon
 * @param {Number} x     X coordinate of the polygon inscribed circle
 * @param {Number} y     Y coordinate of the polygon inscribed circle
 * @param {Number} r     Radius of the polygon inscribed circle
 * @param {Number} side  Side number
 * @param {Number} minus Radian offset
 * @return {Array} Points that make up a regular polygon
 */


function getRegularPolygonPoints(rx, ry, r, side) {
  var minus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : PI * -0.5;
  var radianGap = PI * 2 / side;
  var radians = new Array(side).fill('').map(function (t, i) {
    return i * radianGap + minus;
  });
  return radians.map(function (radian) {
    return getCircleRadianPoint(rx, ry, r, radian);
  });
}

var _default = {
  deepClone: deepClone,
  eliminateBlur: eliminateBlur,
  checkPointIsInCircle: checkPointIsInCircle,
  checkPointIsInPolygon: checkPointIsInPolygon,
  checkPointIsInSector: checkPointIsInSector,
  checkPointIsNearPolyline: checkPointIsNearPolyline,
  getTwoPointDistance: getTwoPointDistance,
  getRotatePointPos: getRotatePointPos,
  getScalePointPos: getScalePointPos,
  getTranslatePointPos: getTranslatePointPos,
  getCircleRadianPoint: getCircleRadianPoint,
  getRegularPolygonPoints: getRegularPolygonPoints,
  getDistanceBetweenPointAndLine: getDistanceBetweenPointAndLine
};
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/slicedToArray":19,"@babel/runtime/helpers/toConsumableArray":20,"@babel/runtime/helpers/typeof":21}],9:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],10:[function(require,module,exports){
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

module.exports = _arrayWithoutHoles;
},{}],11:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],12:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],13:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],14:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],15:[function(require,module,exports){
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],16:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],17:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

module.exports = _nonIterableRest;
},{}],18:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

module.exports = _nonIterableSpread;
},{}],19:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":9,"./iterableToArrayLimit":16,"./nonIterableRest":17}],20:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":10,"./iterableToArray":15,"./nonIterableSpread":18}],21:[function(require,module,exports){
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],22:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":30}],23:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bezierCurveToPolyline = bezierCurveToPolyline;
exports.getBezierCurveLength = getBezierCurveLength;
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var sqrt = Math.sqrt,
    pow = Math.pow,
    ceil = Math.ceil,
    abs = Math.abs; // Initialize the number of points per curve

var defaultSegmentPointsNum = 50;
/**
 * @example data structure of bezierCurve
 * bezierCurve = [
 *  // Starting point of the curve
 *  [10, 10],
 *  // BezierCurve segment data (controlPoint1, controlPoint2, endPoint)
 *  [
 *    [20, 20], [40, 20], [50, 10]
 *  ],
 *  ...
 * ]
 */

/**
 * @description               Abstract the curve as a polyline consisting of N points
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Object}           Calculation results and related data
 * @return {Array}            Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number}           Option.cycles Number of iterations
 * @return {Number}           Option.rounds The number of recursions for the last iteration
 */

function abstractBezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  var segmentsNum = bezierCurve.length - 1;
  var startPoint = bezierCurve[0];
  var endPoint = bezierCurve[segmentsNum][2];
  var segments = bezierCurve.slice(1);
  var getSegmentTPointFuns = segments.map(function (seg, i) {
    var beginPoint = i === 0 ? startPoint : segments[i - 1][2];
    return createGetBezierCurveTPointFun.apply(void 0, [beginPoint].concat((0, _toConsumableArray2["default"])(seg)));
  }); // Initialize the curve to a polyline

  var segmentPointsNum = new Array(segmentsNum).fill(defaultSegmentPointsNum);
  var segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum); // Calculate uniformly distributed points by iteratively

  var result = calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision);
  result.segmentPoints.push(endPoint);
  return result;
}
/**
 * @description  Generate a method for obtaining corresponding point by t according to curve data
 * @param {Array} beginPoint    BezierCurve begin point. [x, y]
 * @param {Array} controlPoint1 BezierCurve controlPoint1. [x, y]
 * @param {Array} controlPoint2 BezierCurve controlPoint2. [x, y]
 * @param {Array} endPoint      BezierCurve end point. [x, y]
 * @return {Function} Expected function
 */


function createGetBezierCurveTPointFun(beginPoint, controlPoint1, controlPoint2, endPoint) {
  return function (t) {
    var tSubed1 = 1 - t;
    var tSubed1Pow3 = pow(tSubed1, 3);
    var tSubed1Pow2 = pow(tSubed1, 2);
    var tPow3 = pow(t, 3);
    var tPow2 = pow(t, 2);
    return [beginPoint[0] * tSubed1Pow3 + 3 * controlPoint1[0] * t * tSubed1Pow2 + 3 * controlPoint2[0] * tPow2 * tSubed1 + endPoint[0] * tPow3, beginPoint[1] * tSubed1Pow3 + 3 * controlPoint1[1] * t * tSubed1Pow2 + 3 * controlPoint2[1] * tPow2 * tSubed1 + endPoint[1] * tPow3];
  };
}
/**
 * @description Get the distance between two points
 * @param {Array} point1 BezierCurve begin point. [x, y]
 * @param {Array} point2 BezierCurve controlPoint1. [x, y]
 * @return {Number} Expected distance
 */


function getTwoPointDistance(_ref, _ref2) {
  var _ref3 = (0, _slicedToArray2["default"])(_ref, 2),
      ax = _ref3[0],
      ay = _ref3[1];

  var _ref4 = (0, _slicedToArray2["default"])(_ref2, 2),
      bx = _ref4[0],
      by = _ref4[1];

  return sqrt(pow(ax - bx, 2) + pow(ay - by, 2));
}
/**
 * @description Get the sum of the array of numbers
 * @param {Array} nums An array of numbers
 * @return {Number} Expected sum
 */


function getNumsSum(nums) {
  return nums.reduce(function (sum, num) {
    return sum + num;
  }, 0);
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsDistance(segmentPoints) {
  return segmentPoints.map(function (points, i) {
    return new Array(points.length - 1).fill(0).map(function (temp, j) {
      return getTwoPointDistance(points[j], points[j + 1]);
    });
  });
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum) {
  return getSegmentTPointFuns.map(function (getSegmentTPointFun, i) {
    var tGap = 1 / segmentPointsNum[i];
    return new Array(segmentPointsNum[i]).fill('').map(function (foo, j) {
      return getSegmentTPointFun(j * tGap);
    });
  });
}
/**
 * @description Get the sum of deviations between line segment and the average length
 * @param {Array} segmentPointsDistance Segment length of polyline
 * @param {Number} avgLength            Average length of the line segment
 * @return {Number} Deviations
 */


function getAllDeviations(segmentPointsDistance, avgLength) {
  return segmentPointsDistance.map(function (seg) {
    return seg.map(function (s) {
      return abs(s - avgLength);
    });
  }).map(function (seg) {
    return getNumsSum(seg);
  }).reduce(function (total, v) {
    return total + v;
  }, 0);
}
/**
 * @description Calculate uniformly distributed points by iteratively
 * @param {Array} segmentPoints        Multiple setd of points that make up a polyline
 * @param {Array} getSegmentTPointFuns Functions of get a point on the curve with t
 * @param {Array} segments             BezierCurve data
 * @param {Number} precision           Calculation accuracy
 * @return {Object} Calculation results and related data
 * @return {Array}  Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number} Option.cycles Number of iterations
 * @return {Number} Option.rounds The number of recursions for the last iteration
 */


function calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision) {
  // The number of loops for the current iteration
  var rounds = 4; // Number of iterations

  var cycles = 1;

  var _loop = function _loop() {
    // Recalculate the number of points per curve based on the last iteration data
    var totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0); // Add last points of segment to calc exact segment length

    segmentPoints.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    var segmentPointsDistance = getSegmentPointsDistance(segmentPoints);
    var lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    var totalLength = getNumsSum(segmentlength);
    var avgLength = totalLength / lineSegmentNum; // Check if precision is reached

    var allDeviations = getAllDeviations(segmentPointsDistance, avgLength);
    if (allDeviations <= precision) return "break";
    totalPointsNum = ceil(avgLength / precision * totalPointsNum * 1.1);
    var segmentPointsNum = segmentlength.map(function (length) {
      return ceil(length / totalLength * totalPointsNum);
    }); // Calculate the points after redistribution

    segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
    totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentPointsForLength = JSON.parse(JSON.stringify(segmentPoints));
    segmentPointsForLength.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    segmentPointsDistance = getSegmentPointsDistance(segmentPointsForLength);
    lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    totalLength = getNumsSum(segmentlength);
    avgLength = totalLength / lineSegmentNum;
    var stepSize = 1 / totalPointsNum / 10; // Recursively for each segment of the polyline

    getSegmentTPointFuns.forEach(function (getSegmentTPointFun, i) {
      var currentSegmentPointsNum = segmentPointsNum[i];
      var t = new Array(currentSegmentPointsNum).fill('').map(function (foo, j) {
        return j / segmentPointsNum[i];
      }); // Repeated recursive offset

      for (var r = 0; r < rounds; r++) {
        var distance = getSegmentPointsDistance([segmentPoints[i]])[0];
        var deviations = distance.map(function (d) {
          return d - avgLength;
        });
        var offset = 0;

        for (var j = 0; j < currentSegmentPointsNum; j++) {
          if (j === 0) return;
          offset += deviations[j - 1];
          t[j] -= stepSize * offset;
          if (t[j] > 1) t[j] = 1;
          if (t[j] < 0) t[j] = 0;
          segmentPoints[i][j] = getSegmentTPointFun(t[j]);
        }
      }
    });
    rounds *= 4;
    cycles++;
  };

  do {
    var _ret = _loop();

    if (_ret === "break") break;
  } while (rounds <= 1025);

  segmentPoints = segmentPoints.reduce(function (all, seg) {
    return all.concat(seg);
  }, []);
  return {
    segmentPoints: segmentPoints,
    cycles: cycles,
    rounds: rounds
  };
}
/**
 * @description Get the polyline corresponding to the Bezier curve
 * @param {Array} bezierCurve BezierCurve data
 * @param {Number} precision  Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array|Boolean} Point data that constitutes a polyline after calculation (Invalid input will return false)
 */


function bezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('bezierCurveToPolyline: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('bezierCurveToPolyline: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('bezierCurveToPolyline: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT.segmentPoints;

  return segmentPoints;
}
/**
 * @description Get the bezier curve length
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number|Boolean} BezierCurve length (Invalid input will return false)
 */


function getBezierCurveLength(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('getBezierCurveLength: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('getBezierCurveLength: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('getBezierCurveLength: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT2 = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT2.segmentPoints; // Calculate the total length of the points that make up the polyline


  var pointsDistance = getSegmentPointsDistance([segmentPoints])[0];
  var length = getNumsSum(pointsDistance);
  return length;
}

var _default = bezierCurveToPolyline;
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/slicedToArray":19,"@babel/runtime/helpers/toConsumableArray":20}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array|Boolean} A set of bezier curve (Invalid input will return false)
 */
function polylineToBezierCurve(polyline) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var offsetA = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;
  var offsetB = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;

  if (!(polyline instanceof Array)) {
    console.error('polylineToBezierCurve: Parameter polyline must be an array!');
    return false;
  }

  if (polyline.length <= 2) {
    console.error('polylineToBezierCurve: Converting to a curve requires at least 3 points!');
    return false;
  }

  var startPoint = polyline[0];
  var bezierCurveLineNum = polyline.length - 1;
  var bezierCurvePoints = new Array(bezierCurveLineNum).fill(0).map(function (foo, i) {
    return [].concat((0, _toConsumableArray2["default"])(getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB)), [polyline[i + 1]]);
  });
  if (close) closeBezierCurve(bezierCurvePoints, startPoint);
  bezierCurvePoints.unshift(polyline[0]);
  return bezierCurvePoints;
}
/**
 * @description Get the control points of the Bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Number} index   The index of which get controls points's point in polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array} Control points
 */


function getBezierCurveLineControlPoints(polyline, index) {
  var close = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var offsetA = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;
  var offsetB = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.25;
  var pointNum = polyline.length;
  if (pointNum < 3 || index >= pointNum) return;
  var beforePointIndex = index - 1;
  if (beforePointIndex < 0) beforePointIndex = close ? pointNum + beforePointIndex : 0;
  var afterPointIndex = index + 1;
  if (afterPointIndex >= pointNum) afterPointIndex = close ? afterPointIndex - pointNum : pointNum - 1;
  var afterNextPointIndex = index + 2;
  if (afterNextPointIndex >= pointNum) afterNextPointIndex = close ? afterNextPointIndex - pointNum : pointNum - 1;
  var pointBefore = polyline[beforePointIndex];
  var pointMiddle = polyline[index];
  var pointAfter = polyline[afterPointIndex];
  var pointAfterNext = polyline[afterNextPointIndex];
  return [[pointMiddle[0] + offsetA * (pointAfter[0] - pointBefore[0]), pointMiddle[1] + offsetA * (pointAfter[1] - pointBefore[1])], [pointAfter[0] - offsetB * (pointAfterNext[0] - pointMiddle[0]), pointAfter[1] - offsetB * (pointAfterNext[1] - pointMiddle[1])]];
}
/**
 * @description Get the last curve of the closure
 * @param {Array} bezierCurve A set of sub-curve
 * @param {Array} startPoint  Start point
 * @return {Array} The last curve for closure
 */


function closeBezierCurve(bezierCurve, startPoint) {
  var firstSubCurve = bezierCurve[0];
  var lastSubCurve = bezierCurve.slice(-1)[0];
  bezierCurve.push([getSymmetryPoint(lastSubCurve[1], lastSubCurve[2]), getSymmetryPoint(firstSubCurve[0], startPoint), startPoint]);
  return bezierCurve;
}
/**
 * @description Get the symmetry point
 * @param {Array} point       Symmetric point
 * @param {Array} centerPoint Symmetric center
 * @return {Array} Symmetric point
 */


function getSymmetryPoint(point, centerPoint) {
  var _point = (0, _slicedToArray2["default"])(point, 2),
      px = _point[0],
      py = _point[1];

  var _centerPoint = (0, _slicedToArray2["default"])(centerPoint, 2),
      cx = _centerPoint[0],
      cy = _centerPoint[1];

  var minusX = cx - px;
  var minusY = cy - py;
  return [cx + minusX, cy + minusY];
}

var _default = polylineToBezierCurve;
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/slicedToArray":19,"@babel/runtime/helpers/toConsumableArray":20}],25:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "bezierCurveToPolyline", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.bezierCurveToPolyline;
  }
});
Object.defineProperty(exports, "getBezierCurveLength", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.getBezierCurveLength;
  }
});
Object.defineProperty(exports, "polylineToBezierCurve", {
  enumerable: true,
  get: function get() {
    return _polylineToBezierCurve["default"];
  }
});
exports["default"] = void 0;

var _bezierCurveToPolyline = require("./core/bezierCurveToPolyline");

var _polylineToBezierCurve = _interopRequireDefault(require("./core/polylineToBezierCurve"));

var _default = {
  bezierCurveToPolyline: _bezierCurveToPolyline.bezierCurveToPolyline,
  getBezierCurveLength: _bezierCurveToPolyline.getBezierCurveLength,
  polylineToBezierCurve: _polylineToBezierCurve["default"]
};
exports["default"] = _default;
},{"./core/bezierCurveToPolyline":23,"./core/polylineToBezierCurve":24,"@babel/runtime/helpers/interopRequireDefault":14}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = new Map([['transparent', 'rgba(0,0,0,0)'], ['black', '#000000'], ['silver', '#C0C0C0'], ['gray', '#808080'], ['white', '#FFFFFF'], ['maroon', '#800000'], ['red', '#FF0000'], ['purple', '#800080'], ['fuchsia', '#FF00FF'], ['green', '#008000'], ['lime', '#00FF00'], ['olive', '#808000'], ['yellow', '#FFFF00'], ['navy', '#000080'], ['blue', '#0000FF'], ['teal', '#008080'], ['aqua', '#00FFFF'], ['aliceblue', '#f0f8ff'], ['antiquewhite', '#faebd7'], ['aquamarine', '#7fffd4'], ['azure', '#f0ffff'], ['beige', '#f5f5dc'], ['bisque', '#ffe4c4'], ['blanchedalmond', '#ffebcd'], ['blueviolet', '#8a2be2'], ['brown', '#a52a2a'], ['burlywood', '#deb887'], ['cadetblue', '#5f9ea0'], ['chartreuse', '#7fff00'], ['chocolate', '#d2691e'], ['coral', '#ff7f50'], ['cornflowerblue', '#6495ed'], ['cornsilk', '#fff8dc'], ['crimson', '#dc143c'], ['cyan', '#00ffff'], ['darkblue', '#00008b'], ['darkcyan', '#008b8b'], ['darkgoldenrod', '#b8860b'], ['darkgray', '#a9a9a9'], ['darkgreen', '#006400'], ['darkgrey', '#a9a9a9'], ['darkkhaki', '#bdb76b'], ['darkmagenta', '#8b008b'], ['darkolivegreen', '#556b2f'], ['darkorange', '#ff8c00'], ['darkorchid', '#9932cc'], ['darkred', '#8b0000'], ['darksalmon', '#e9967a'], ['darkseagreen', '#8fbc8f'], ['darkslateblue', '#483d8b'], ['darkslategray', '#2f4f4f'], ['darkslategrey', '#2f4f4f'], ['darkturquoise', '#00ced1'], ['darkviolet', '#9400d3'], ['deeppink', '#ff1493'], ['deepskyblue', '#00bfff'], ['dimgray', '#696969'], ['dimgrey', '#696969'], ['dodgerblue', '#1e90ff'], ['firebrick', '#b22222'], ['floralwhite', '#fffaf0'], ['forestgreen', '#228b22'], ['gainsboro', '#dcdcdc'], ['ghostwhite', '#f8f8ff'], ['gold', '#ffd700'], ['goldenrod', '#daa520'], ['greenyellow', '#adff2f'], ['grey', '#808080'], ['honeydew', '#f0fff0'], ['hotpink', '#ff69b4'], ['indianred', '#cd5c5c'], ['indigo', '#4b0082'], ['ivory', '#fffff0'], ['khaki', '#f0e68c'], ['lavender', '#e6e6fa'], ['lavenderblush', '#fff0f5'], ['lawngreen', '#7cfc00'], ['lemonchiffon', '#fffacd'], ['lightblue', '#add8e6'], ['lightcoral', '#f08080'], ['lightcyan', '#e0ffff'], ['lightgoldenrodyellow', '#fafad2'], ['lightgray', '#d3d3d3'], ['lightgreen', '#90ee90'], ['lightgrey', '#d3d3d3'], ['lightpink', '#ffb6c1'], ['lightsalmon', '#ffa07a'], ['lightseagreen', '#20b2aa'], ['lightskyblue', '#87cefa'], ['lightslategray', '#778899'], ['lightslategrey', '#778899'], ['lightsteelblue', '#b0c4de'], ['lightyellow', '#ffffe0'], ['limegreen', '#32cd32'], ['linen', '#faf0e6'], ['magenta', '#ff00ff'], ['mediumaquamarine', '#66cdaa'], ['mediumblue', '#0000cd'], ['mediumorchid', '#ba55d3'], ['mediumpurple', '#9370db'], ['mediumseagreen', '#3cb371'], ['mediumslateblue', '#7b68ee'], ['mediumspringgreen', '#00fa9a'], ['mediumturquoise', '#48d1cc'], ['mediumvioletred', '#c71585'], ['midnightblue', '#191970'], ['mintcream', '#f5fffa'], ['mistyrose', '#ffe4e1'], ['moccasin', '#ffe4b5'], ['navajowhite', '#ffdead'], ['oldlace', '#fdf5e6'], ['olivedrab', '#6b8e23'], ['orange', '#ffa500'], ['orangered', '#ff4500'], ['orchid', '#da70d6'], ['palegoldenrod', '#eee8aa'], ['palegreen', '#98fb98'], ['paleturquoise', '#afeeee'], ['palevioletred', '#db7093'], ['papayawhip', '#ffefd5'], ['peachpuff', '#ffdab9'], ['peru', '#cd853f'], ['pink', '#ffc0cb'], ['plum', '#dda0dd'], ['powderblue', '#b0e0e6'], ['rosybrown', '#bc8f8f'], ['royalblue', '#4169e1'], ['saddlebrown', '#8b4513'], ['salmon', '#fa8072'], ['sandybrown', '#f4a460'], ['seagreen', '#2e8b57'], ['seashell', '#fff5ee'], ['sienna', '#a0522d'], ['skyblue', '#87ceeb'], ['slateblue', '#6a5acd'], ['slategray', '#708090'], ['slategrey', '#708090'], ['snow', '#fffafa'], ['springgreen', '#00ff7f'], ['steelblue', '#4682b4'], ['tan', '#d2b48c'], ['thistle', '#d8bfd8'], ['tomato', '#ff6347'], ['turquoise', '#40e0d0'], ['violet', '#ee82ee'], ['wheat', '#f5deb3'], ['whitesmoke', '#f5f5f5'], ['yellowgreen', '#9acd32']]);

exports["default"] = _default;
},{}],27:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRgbValue = getRgbValue;
exports.getRgbaValue = getRgbaValue;
exports.getOpacity = getOpacity;
exports.toRgb = toRgb;
exports.toHex = toHex;
exports.getColorFromRgbValue = getColorFromRgbValue;
exports.darken = darken;
exports.lighten = lighten;
exports.fade = fade;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _keywords = _interopRequireDefault(require("./config/keywords"));

var hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
var rgbReg = /^(rgb|rgba|RGB|RGBA)/;
var rgbaReg = /^(rgba|RGBA)/;
/**
 * @description Color validator
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {String|Boolean} Valid color Or false
 */

function validator(color) {
  var isHex = hexReg.test(color);
  var isRgb = rgbReg.test(color);
  if (isHex || isRgb) return color;
  color = getColorByKeyword(color);

  if (!color) {
    console.error('Color: Invalid color!');
    return false;
  }

  return color;
}
/**
 * @description Get color by keyword
 * @param {String} keyword Color keyword like red, green and etc.
 * @return {String|Boolean} Hex or rgba color (Invalid keyword will return false)
 */


function getColorByKeyword(keyword) {
  if (!keyword) {
    console.error('getColorByKeywords: Missing parameters!');
    return false;
  }

  if (!_keywords["default"].has(keyword)) return false;
  return _keywords["default"].get(keyword);
}
/**
 * @description Get the Rgb value of the color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Array<Number>|Boolean} Rgb value of the color (Invalid input will return false)
 */


function getRgbValue(color) {
  if (!color) {
    console.error('getRgbValue: Missing parameters!');
    return false;
  }

  color = validator(color);
  if (!color) return false;
  var isHex = hexReg.test(color);
  var isRgb = rgbReg.test(color);
  var lowerColor = color.toLowerCase();
  if (isHex) return getRgbValueFromHex(lowerColor);
  if (isRgb) return getRgbValueFromRgb(lowerColor);
}
/**
 * @description Get the rgb value of the hex color
 * @param {String} color Hex color
 * @return {Array<Number>} Rgb value of the color
 */


function getRgbValueFromHex(color) {
  color = color.replace('#', '');
  if (color.length === 3) color = Array.from(color).map(function (hexNum) {
    return hexNum + hexNum;
  }).join('');
  color = color.split('');
  return new Array(3).fill(0).map(function (t, i) {
    return parseInt("0x".concat(color[i * 2]).concat(color[i * 2 + 1]));
  });
}
/**
 * @description Get the rgb value of the rgb/rgba color
 * @param {String} color Hex color
 * @return {Array} Rgb value of the color
 */


function getRgbValueFromRgb(color) {
  return color.replace(/rgb\(|rgba\(|\)/g, '').split(',').slice(0, 3).map(function (n) {
    return parseInt(n);
  });
}
/**
 * @description Get the Rgba value of the color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Array<Number>|Boolean} Rgba value of the color (Invalid input will return false)
 */


function getRgbaValue(color) {
  if (!color) {
    console.error('getRgbaValue: Missing parameters!');
    return false;
  }

  var colorValue = getRgbValue(color);
  if (!colorValue) return false;
  colorValue.push(getOpacity(color));
  return colorValue;
}
/**
 * @description Get the opacity of color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number|Boolean} Color opacity (Invalid input will return false)
 */


function getOpacity(color) {
  if (!color) {
    console.error('getOpacity: Missing parameters!');
    return false;
  }

  color = validator(color);
  if (!color) return false;
  var isRgba = rgbaReg.test(color);
  if (!isRgba) return 1;
  color = color.toLowerCase();
  return Number(color.split(',').slice(-1)[0].replace(/[)|\s]/g, ''));
}
/**
 * @description Convert color to Rgb|Rgba color
 * @param {String} color   Hex|Rgb|Rgba color or color keyword
 * @param {Number} opacity The opacity of color
 * @return {String|Boolean} Rgb|Rgba color (Invalid input will return false)
 */


function toRgb(color, opacity) {
  if (!color) {
    console.error('toRgb: Missing parameters!');
    return false;
  }

  var rgbValue = getRgbValue(color);
  if (!rgbValue) return false;
  var addOpacity = typeof opacity === 'number';
  if (addOpacity) return 'rgba(' + rgbValue.join(',') + ",".concat(opacity, ")");
  return 'rgb(' + rgbValue.join(',') + ')';
}
/**
 * @description Convert color to Hex color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {String|Boolean} Hex color (Invalid input will return false)
 */


function toHex(color) {
  if (!color) {
    console.error('toHex: Missing parameters!');
    return false;
  }

  if (hexReg.test(color)) return color;
  color = getRgbValue(color);
  if (!color) return false;
  return '#' + color.map(function (n) {
    return Number(n).toString(16);
  }).map(function (n) {
    return n === '0' ? '00' : n;
  }).join('');
}
/**
 * @description Get Color from Rgb|Rgba value
 * @param {Array<Number>} value Rgb|Rgba color value
 * @return {String|Boolean} Rgb|Rgba color (Invalid input will return false)
 */


function getColorFromRgbValue(value) {
  if (!value) {
    console.error('getColorFromRgbValue: Missing parameters!');
    return false;
  }

  var valueLength = value.length;

  if (valueLength !== 3 && valueLength !== 4) {
    console.error('getColorFromRgbValue: Value is illegal!');
    return false;
  }

  var color = valueLength === 3 ? 'rgb(' : 'rgba(';
  color += value.join(',') + ')';
  return color;
}
/**
 * @description Deepen color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number} Percent of Deepen (1-100)
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function darken(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!color) {
    console.error('darken: Missing parameters!');
    return false;
  }

  var rgbaValue = getRgbaValue(color);
  if (!rgbaValue) return false;
  rgbaValue = rgbaValue.map(function (v, i) {
    return i === 3 ? v : v - Math.ceil(2.55 * percent);
  }).map(function (v) {
    return v < 0 ? 0 : v;
  });
  return getColorFromRgbValue(rgbaValue);
}
/**
 * @description Brighten color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number} Percent of brighten (1-100)
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function lighten(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!color) {
    console.error('lighten: Missing parameters!');
    return false;
  }

  var rgbaValue = getRgbaValue(color);
  if (!rgbaValue) return false;
  rgbaValue = rgbaValue.map(function (v, i) {
    return i === 3 ? v : v + Math.ceil(2.55 * percent);
  }).map(function (v) {
    return v > 255 ? 255 : v;
  });
  return getColorFromRgbValue(rgbaValue);
}
/**
 * @description Adjust color opacity
 * @param {String} color   Hex|Rgb|Rgba color or color keyword
 * @param {Number} Percent of opacity
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function fade(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  if (!color) {
    console.error('fade: Missing parameters!');
    return false;
  }

  var rgbValue = getRgbValue(color);
  if (!rgbValue) return false;
  var rgbaValue = [].concat((0, _toConsumableArray2["default"])(rgbValue), [percent / 100]);
  return getColorFromRgbValue(rgbaValue);
}

var _default = {
  fade: fade,
  toHex: toHex,
  toRgb: toRgb,
  darken: darken,
  lighten: lighten,
  getOpacity: getOpacity,
  getRgbValue: getRgbValue,
  getRgbaValue: getRgbaValue,
  getColorFromRgbValue: getColorFromRgbValue
};
exports["default"] = _default;
},{"./config/keywords":26,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/toConsumableArray":20}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.easeInOutBounce = exports.easeOutBounce = exports.easeInBounce = exports.easeInOutElastic = exports.easeOutElastic = exports.easeInElastic = exports.easeInOutBack = exports.easeOutBack = exports.easeInBack = exports.easeInOutQuint = exports.easeOutQuint = exports.easeInQuint = exports.easeInOutQuart = exports.easeOutQuart = exports.easeInQuart = exports.easeInOutCubic = exports.easeOutCubic = exports.easeInCubic = exports.easeInOutQuad = exports.easeOutQuad = exports.easeInQuad = exports.easeInOutSine = exports.easeOutSine = exports.easeInSine = exports.linear = void 0;
var linear = [[[0, 1], '', [0.33, 0.67]], [[1, 0], [0.67, 0.33]]];
/**
 * @description Sine
 */

exports.linear = linear;
var easeInSine = [[[0, 1]], [[0.538, 0.564], [0.169, 0.912], [0.880, 0.196]], [[1, 0]]];
exports.easeInSine = easeInSine;
var easeOutSine = [[[0, 1]], [[0.444, 0.448], [0.169, 0.736], [0.718, 0.16]], [[1, 0]]];
exports.easeOutSine = easeOutSine;
var easeInOutSine = [[[0, 1]], [[0.5, 0.5], [0.2, 1], [0.8, 0]], [[1, 0]]];
/**
 * @description Quad
 */

exports.easeInOutSine = easeInOutSine;
var easeInQuad = [[[0, 1]], [[0.550, 0.584], [0.231, 0.904], [0.868, 0.264]], [[1, 0]]];
exports.easeInQuad = easeInQuad;
var easeOutQuad = [[[0, 1]], [[0.413, 0.428], [0.065, 0.816], [0.760, 0.04]], [[1, 0]]];
exports.easeOutQuad = easeOutQuad;
var easeInOutQuad = [[[0, 1]], [[0.5, 0.5], [0.3, 0.9], [0.7, 0.1]], [[1, 0]]];
/**
 * @description Cubic
 */

exports.easeInOutQuad = easeInOutQuad;
var easeInCubic = [[[0, 1]], [[0.679, 0.688], [0.366, 0.992], [0.992, 0.384]], [[1, 0]]];
exports.easeInCubic = easeInCubic;
var easeOutCubic = [[[0, 1]], [[0.321, 0.312], [0.008, 0.616], [0.634, 0.008]], [[1, 0]]];
exports.easeOutCubic = easeOutCubic;
var easeInOutCubic = [[[0, 1]], [[0.5, 0.5], [0.3, 1], [0.7, 0]], [[1, 0]]];
/**
 * @description Quart
 */

exports.easeInOutCubic = easeInOutCubic;
var easeInQuart = [[[0, 1]], [[0.812, 0.74], [0.611, 0.988], [1.013, 0.492]], [[1, 0]]];
exports.easeInQuart = easeInQuart;
var easeOutQuart = [[[0, 1]], [[0.152, 0.244], [0.001, 0.448], [0.285, -0.02]], [[1, 0]]];
exports.easeOutQuart = easeOutQuart;
var easeInOutQuart = [[[0, 1]], [[0.5, 0.5], [0.4, 1], [0.6, 0]], [[1, 0]]];
/**
 * @description Quint
 */

exports.easeInOutQuart = easeInOutQuart;
var easeInQuint = [[[0, 1]], [[0.857, 0.856], [0.714, 1], [1, 0.712]], [[1, 0]]];
exports.easeInQuint = easeInQuint;
var easeOutQuint = [[[0, 1]], [[0.108, 0.2], [0.001, 0.4], [0.214, -0.012]], [[1, 0]]];
exports.easeOutQuint = easeOutQuint;
var easeInOutQuint = [[[0, 1]], [[0.5, 0.5], [0.5, 1], [0.5, 0]], [[1, 0]]];
/**
 * @description Back
 */

exports.easeInOutQuint = easeInOutQuint;
var easeInBack = [[[0, 1]], [[0.667, 0.896], [0.380, 1.184], [0.955, 0.616]], [[1, 0]]];
exports.easeInBack = easeInBack;
var easeOutBack = [[[0, 1]], [[0.335, 0.028], [0.061, 0.22], [0.631, -0.18]], [[1, 0]]];
exports.easeOutBack = easeOutBack;
var easeInOutBack = [[[0, 1]], [[0.5, 0.5], [0.4, 1.4], [0.6, -0.4]], [[1, 0]]];
/**
 * @description Elastic
 */

exports.easeInOutBack = easeInOutBack;
var easeInElastic = [[[0, 1]], [[0.474, 0.964], [0.382, 0.988], [0.557, 0.952]], [[0.619, 1.076], [0.565, 1.088], [0.669, 1.08]], [[0.770, 0.916], [0.712, 0.924], [0.847, 0.904]], [[0.911, 1.304], [0.872, 1.316], [0.961, 1.34]], [[1, 0]]];
exports.easeInElastic = easeInElastic;
var easeOutElastic = [[[0, 1]], [[0.073, -0.32], [0.034, -0.328], [0.104, -0.344]], [[0.191, 0.092], [0.110, 0.06], [0.256, 0.08]], [[0.310, -0.076], [0.260, -0.068], [0.357, -0.076]], [[0.432, 0.032], [0.362, 0.028], [0.683, -0.004]], [[1, 0]]];
exports.easeOutElastic = easeOutElastic;
var easeInOutElastic = [[[0, 1]], [[0.210, 0.94], [0.167, 0.884], [0.252, 0.98]], [[0.299, 1.104], [0.256, 1.092], [0.347, 1.108]], [[0.5, 0.496], [0.451, 0.672], [0.548, 0.324]], [[0.696, -0.108], [0.652, -0.112], [0.741, -0.124]], [[0.805, 0.064], [0.756, 0.012], [0.866, 0.096]], [[1, 0]]];
/**
 * @description Bounce
 */

exports.easeInOutElastic = easeInOutElastic;
var easeInBounce = [[[0, 1]], [[0.148, 1], [0.075, 0.868], [0.193, 0.848]], [[0.326, 1], [0.276, 0.836], [0.405, 0.712]], [[0.600, 1], [0.511, 0.708], [0.671, 0.348]], [[1, 0]]];
exports.easeInBounce = easeInBounce;
var easeOutBounce = [[[0, 1]], [[0.357, 0.004], [0.270, 0.592], [0.376, 0.252]], [[0.604, -0.004], [0.548, 0.312], [0.669, 0.184]], [[0.820, 0], [0.749, 0.184], [0.905, 0.132]], [[1, 0]]];
exports.easeOutBounce = easeOutBounce;
var easeInOutBounce = [[[0, 1]], [[0.102, 1], [0.050, 0.864], [0.117, 0.86]], [[0.216, 0.996], [0.208, 0.844], [0.227, 0.808]], [[0.347, 0.996], [0.343, 0.8], [0.480, 0.292]], [[0.635, 0.004], [0.511, 0.676], [0.656, 0.208]], [[0.787, 0], [0.760, 0.2], [0.795, 0.144]], [[0.905, -0.004], [0.899, 0.164], [0.944, 0.144]], [[1, 0]]];
exports.easeInOutBounce = easeInOutBounce;

var _default = new Map([['linear', linear], ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad], ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic], ['easeInQuart', easeInQuart], ['easeOutQuart', easeOutQuart], ['easeInOutQuart', easeInOutQuart], ['easeInQuint', easeInQuint], ['easeOutQuint', easeOutQuint], ['easeInOutQuint', easeInOutQuint], ['easeInBack', easeInBack], ['easeOutBack', easeOutBack], ['easeInOutBack', easeInOutBack], ['easeInElastic', easeInElastic], ['easeOutElastic', easeOutElastic], ['easeInOutElastic', easeInOutElastic], ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce]]);

exports["default"] = _default;
},{}],29:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transition = transition;
exports.injectNewCurve = injectNewCurve;
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _curves = _interopRequireDefault(require("./config/curves"));

var defaultTransitionBC = 'linear';
/**
 * @description Get the N-frame animation state by the start and end state
 *              of the animation and the easing curve
 * @param {String|Array} tBC               Easing curve name or data
 * @param {Number|Array|Object} startState Animation start state
 * @param {Number|Array|Object} endState   Animation end state
 * @param {Number} frameNum                Number of Animation frames
 * @param {Boolean} deep                   Whether to use recursive mode
 * @return {Array|Boolean} State of each frame of the animation (Invalid input will return false)
 */

function transition(tBC) {
  var startState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var endState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var frameNum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30;
  var deep = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  if (!checkParams.apply(void 0, arguments)) return false;

  try {
    // Get the transition bezier curve
    var bezierCurve = getBezierCurve(tBC); // Get the progress of each frame state

    var frameStateProgress = getFrameStateProgress(bezierCurve, frameNum); // If the recursion mode is not enabled or the state type is Number, the shallow state calculation is performed directly.

    if (!deep || typeof endState === 'number') return getTransitionState(startState, endState, frameStateProgress);
    return recursionTransitionState(startState, endState, frameStateProgress);
  } catch (_unused) {
    console.warn('Transition parameter may be abnormal!');
    return [endState];
  }
}
/**
 * @description Check if the parameters are legal
 * @param {String} tBC      Name of transition bezier curve
 * @param {Any} startState  Transition start state
 * @param {Any} endState    Transition end state
 * @param {Number} frameNum Number of transition frames
 * @return {Boolean} Is the parameter legal
 */


function checkParams(tBC) {
  var startState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var endState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var frameNum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30;

  if (!tBC || startState === false || endState === false || !frameNum) {
    console.error('transition: Missing Parameters!');
    return false;
  }

  if ((0, _typeof2["default"])(startState) !== (0, _typeof2["default"])(endState)) {
    console.error('transition: Inconsistent Status Types!');
    return false;
  }

  var stateType = (0, _typeof2["default"])(endState);

  if (stateType === 'string' || stateType === 'boolean' || !tBC.length) {
    console.error('transition: Unsupported Data Type of State!');
    return false;
  }

  if (!_curves["default"].has(tBC) && !(tBC instanceof Array)) {
    console.warn('transition: Transition curve not found, default curve will be used!');
  }

  return true;
}
/**
 * @description Get the transition bezier curve
 * @param {String} tBC Name of transition bezier curve
 * @return {Array} Bezier curve data
 */


function getBezierCurve(tBC) {
  var bezierCurve = '';

  if (_curves["default"].has(tBC)) {
    bezierCurve = _curves["default"].get(tBC);
  } else if (tBC instanceof Array) {
    bezierCurve = tBC;
  } else {
    bezierCurve = _curves["default"].get(defaultTransitionBC);
  }

  return bezierCurve;
}
/**
 * @description Get the progress of each frame state
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} frameNum   Number of transition frames
 * @return {Array} Progress of each frame state
 */


function getFrameStateProgress(bezierCurve, frameNum) {
  var tMinus = 1 / (frameNum - 1);
  var tState = new Array(frameNum).fill(0).map(function (t, i) {
    return i * tMinus;
  });
  var frameState = tState.map(function (t) {
    return getFrameStateFromT(bezierCurve, t);
  });
  return frameState;
}
/**
 * @description Get the progress of the corresponding frame according to t
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} t          Current frame t
 * @return {Number} Progress of current frame
 */


function getFrameStateFromT(bezierCurve, t) {
  var tBezierCurvePoint = getBezierCurvePointFromT(bezierCurve, t);
  var bezierCurvePointT = getBezierCurvePointTFromReT(tBezierCurvePoint, t);
  return getBezierCurveTState(tBezierCurvePoint, bezierCurvePointT);
}
/**
 * @description Get the corresponding sub-curve according to t
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} t          Current frame t
 * @return {Array} Sub-curve of t
 */


function getBezierCurvePointFromT(bezierCurve, t) {
  var lastIndex = bezierCurve.length - 1;
  var begin = '',
      end = '';
  bezierCurve.findIndex(function (item, i) {
    if (i === lastIndex) return;
    begin = item;
    end = bezierCurve[i + 1];
    var currentMainPointX = begin[0][0];
    var nextMainPointX = end[0][0];
    return t >= currentMainPointX && t < nextMainPointX;
  });
  var p0 = begin[0];
  var p1 = begin[2] || begin[0];
  var p2 = end[1] || end[0];
  var p3 = end[0];
  return [p0, p1, p2, p3];
}
/**
 * @description Get local t based on t and sub-curve
 * @param {Array} bezierCurve Sub-curve
 * @param {Number} t          Current frame t
 * @return {Number} local t of sub-curve
 */


function getBezierCurvePointTFromReT(bezierCurve, t) {
  var reBeginX = bezierCurve[0][0];
  var reEndX = bezierCurve[3][0];
  var xMinus = reEndX - reBeginX;
  var tMinus = t - reBeginX;
  return tMinus / xMinus;
}
/**
 * @description Get the curve progress of t
 * @param {Array} bezierCurve Sub-curve
 * @param {Number} t          Current frame t
 * @return {Number} Progress of current frame
 */


function getBezierCurveTState(_ref, t) {
  var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
      _ref2$ = (0, _slicedToArray2["default"])(_ref2[0], 2),
      p0 = _ref2$[1],
      _ref2$2 = (0, _slicedToArray2["default"])(_ref2[1], 2),
      p1 = _ref2$2[1],
      _ref2$3 = (0, _slicedToArray2["default"])(_ref2[2], 2),
      p2 = _ref2$3[1],
      _ref2$4 = (0, _slicedToArray2["default"])(_ref2[3], 2),
      p3 = _ref2$4[1];

  var pow = Math.pow;
  var tMinus = 1 - t;
  var result1 = p0 * pow(tMinus, 3);
  var result2 = 3 * p1 * t * pow(tMinus, 2);
  var result3 = 3 * p2 * pow(t, 2) * tMinus;
  var result4 = p3 * pow(t, 3);
  return 1 - (result1 + result2 + result3 + result4);
}
/**
 * @description Get transition state according to frame progress
 * @param {Any} startState   Transition start state
 * @param {Any} endState     Transition end state
 * @param {Array} frameState Frame state progress
 * @return {Array} Transition frame state
 */


function getTransitionState(begin, end, frameState) {
  var stateType = 'object';
  if (typeof begin === 'number') stateType = 'number';
  if (begin instanceof Array) stateType = 'array';
  if (stateType === 'number') return getNumberTransitionState(begin, end, frameState);
  if (stateType === 'array') return getArrayTransitionState(begin, end, frameState);
  if (stateType === 'object') return getObjectTransitionState(begin, end, frameState);
  return frameState.map(function (t) {
    return end;
  });
}
/**
 * @description Get the transition data of the number type
 * @param {Number} startState Transition start state
 * @param {Number} endState   Transition end state
 * @param {Array} frameState  Frame state progress
 * @return {Array} Transition frame state
 */


function getNumberTransitionState(begin, end, frameState) {
  var minus = end - begin;
  return frameState.map(function (s) {
    return begin + minus * s;
  });
}
/**
 * @description Get the transition data of the array type
 * @param {Array} startState Transition start state
 * @param {Array} endState   Transition end state
 * @param {Array} frameState Frame state progress
 * @return {Array} Transition frame state
 */


function getArrayTransitionState(begin, end, frameState) {
  var minus = end.map(function (v, i) {
    if (typeof v !== 'number') return false;
    return v - begin[i];
  });
  return frameState.map(function (s) {
    return minus.map(function (v, i) {
      if (v === false) return end[i];
      return begin[i] + v * s;
    });
  });
}
/**
 * @description Get the transition data of the object type
 * @param {Object} startState Transition start state
 * @param {Object} endState   Transition end state
 * @param {Array} frameState  Frame state progress
 * @return {Array} Transition frame state
 */


function getObjectTransitionState(begin, end, frameState) {
  var keys = Object.keys(end);
  var beginValue = keys.map(function (k) {
    return begin[k];
  });
  var endValue = keys.map(function (k) {
    return end[k];
  });
  var arrayState = getArrayTransitionState(beginValue, endValue, frameState);
  return arrayState.map(function (item) {
    var frameData = {};
    item.forEach(function (v, i) {
      return frameData[keys[i]] = v;
    });
    return frameData;
  });
}
/**
 * @description Get the transition state data by recursion
 * @param {Array|Object} startState Transition start state
 * @param {Array|Object} endState   Transition end state
 * @param {Array} frameState        Frame state progress
 * @return {Array} Transition frame state
 */


function recursionTransitionState(begin, end, frameState) {
  var state = getTransitionState(begin, end, frameState);

  var _loop = function _loop(key) {
    var bTemp = begin[key];
    var eTemp = end[key];
    if ((0, _typeof2["default"])(eTemp) !== 'object') return "continue";
    var data = recursionTransitionState(bTemp, eTemp, frameState);
    state.forEach(function (fs, i) {
      return fs[key] = data[i];
    });
  };

  for (var key in end) {
    var _ret = _loop(key);

    if (_ret === "continue") continue;
  }

  return state;
}
/**
 * @description Inject new curve into curves as config
 * @param {Any} key     The key of curve
 * @param {Array} curve Bezier curve data
 * @return {Undefined} No return
 */


function injectNewCurve(key, curve) {
  if (!key || !curve) {
    console.error('InjectNewCurve Missing Parameters!');
    return;
  }

  _curves["default"].set(key, curve);
}

var _default = transition;
exports["default"] = _default;
},{"./config/curves":28,"@babel/runtime/helpers/interopRequireDefault":14,"@babel/runtime/helpers/slicedToArray":19,"@babel/runtime/helpers/typeof":21}],30:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9lbnRyeS5qcyIsImxpYi9jbGFzcy9jcmVuZGVyLmNsYXNzLmpzIiwibGliL2NsYXNzL2dyYXBoLmNsYXNzLmpzIiwibGliL2NsYXNzL3N0eWxlLmNsYXNzLmpzIiwibGliL2NvbmZpZy9ncmFwaHMuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcGx1Z2luL2NhbnZhcy5qcyIsImxpYi9wbHVnaW4vdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXJyYXlXaXRob3V0SG9sZXMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2l0ZXJhYmxlVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvbm9uSXRlcmFibGVSZXN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvbm9uSXRlcmFibGVTcHJlYWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvcmVnZW5lcmF0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9iZXppZXItY3VydmUvbGliL2NvcmUvYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYmV6aWVyLWN1cnZlL2xpYi9jb3JlL3BvbHlsaW5lVG9CZXppZXJDdXJ2ZS5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2Jlemllci1jdXJ2ZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jb2xvci9saWIvY29uZmlnL2tleXdvcmRzLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvY29sb3IvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvdHJhbnNpdGlvbi9saWIvY29uZmlnL2N1cnZlcy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL3RyYW5zaXRpb24vbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIENSZW5kZXIgPSByZXF1aXJlKCcuLi9saWIvaW5kZXgnKVxuXG53aW5kb3cuQ1JlbmRlciA9IENSZW5kZXIiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9jb2xvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIikpO1xuXG52YXIgX2JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfZ3JhcGhzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi4vY29uZmlnL2dyYXBoc1wiKSk7XG5cbnZhciBfZ3JhcGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2dyYXBoLmNsYXNzXCIpKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICBDbGFzcyBvZiBDUmVuZGVyXG4gKiBAcGFyYW0ge09iamVjdH0gY2FudmFzIENhbnZhcyBET01cbiAqIEByZXR1cm4ge0NSZW5kZXJ9ICAgICAgSW5zdGFuY2Ugb2YgQ1JlbmRlclxuICovXG52YXIgQ1JlbmRlciA9IGZ1bmN0aW9uIENSZW5kZXIoY2FudmFzKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgQ1JlbmRlcik7XG5cbiAgaWYgKCFjYW52YXMpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDUmVuZGVyIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIHZhciBjbGllbnRXaWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgIGNsaWVudEhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQ7XG4gIHZhciBhcmVhID0gW2NsaWVudFdpZHRoLCBjbGllbnRIZWlnaHRdO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNsaWVudFdpZHRoKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2xpZW50SGVpZ2h0KTtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDb250ZXh0IG9mIHRoZSBjYW52YXNcbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGV4YW1wbGUgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICovXG5cbiAgdGhpcy5jdHggPSBjdHg7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY2FudmFzXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGV4YW1wbGUgYXJlYSA9IFszMDDvvIwxMDBdXG4gICAqL1xuXG4gIHRoaXMuYXJlYSA9IGFyZWE7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciByZW5kZXIgaXMgaW4gYW5pbWF0aW9uIHJlbmRlcmluZ1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGV4YW1wbGUgYW5pbWF0aW9uU3RhdHVzID0gdHJ1ZXxmYWxzZVxuICAgKi9cblxuICB0aGlzLmFuaW1hdGlvblN0YXR1cyA9IGZhbHNlO1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEFkZGVkIGdyYXBoXG4gICAqIEB0eXBlIHtbR3JhcGhdfVxuICAgKiBAZXhhbXBsZSBncmFwaHMgPSBbR3JhcGgsIEdyYXBoLCAuLi5dXG4gICAqL1xuXG4gIHRoaXMuZ3JhcGhzID0gW107XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ29sb3IgcGx1Z2luXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9qaWFtaW5nNzQzL2NvbG9yXG4gICAqL1xuXG4gIHRoaXMuY29sb3IgPSBfY29sb3JbXCJkZWZhdWx0XCJdO1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJlemllciBDdXJ2ZSBwbHVnaW5cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvQmV6aWVyQ3VydmVcbiAgICovXG5cbiAgdGhpcy5iZXppZXJDdXJ2ZSA9IF9iZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl07IC8vIGJpbmQgZXZlbnQgaGFuZGxlclxuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBtb3VzZURvd24uYmluZCh0aGlzKSk7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2VVcC5iaW5kKHRoaXMpKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgQ2xlYXIgY2FudmFzIGRyYXdpbmcgYXJlYVxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENSZW5kZXI7XG5cbkNSZW5kZXIucHJvdG90eXBlLmNsZWFyQXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzJGN0eDtcblxuICB2YXIgYXJlYSA9IHRoaXMuYXJlYTtcblxuICAoX3RoaXMkY3R4ID0gdGhpcy5jdHgpLmNsZWFyUmVjdC5hcHBseShfdGhpcyRjdHgsIFswLCAwXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhcmVhKSkpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICBBZGQgZ3JhcGggdG8gcmVuZGVyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEdyYXBoIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm4ge0dyYXBofSAgICAgICAgR3JhcGggaW5zdGFuY2VcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gIHZhciBuYW1lID0gY29uZmlnLm5hbWU7XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgY29uc29sZS5lcnJvcignYWRkIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZ3JhcGhDb25maWcgPSBfZ3JhcGhzW1wiZGVmYXVsdFwiXS5nZXQobmFtZSk7XG5cbiAgaWYgKCFncmFwaENvbmZpZykge1xuICAgIGNvbnNvbGUud2FybignTm8gY29ycmVzcG9uZGluZyBncmFwaCBjb25maWd1cmF0aW9uIGZvdW5kIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBncmFwaCA9IG5ldyBfZ3JhcGhbXCJkZWZhdWx0XCJdKGdyYXBoQ29uZmlnLCBjb25maWcpO1xuICBpZiAoIWdyYXBoLnZhbGlkYXRvcihncmFwaCkpIHJldHVybjtcbiAgZ3JhcGgucmVuZGVyID0gdGhpcztcbiAgdGhpcy5ncmFwaHMucHVzaChncmFwaCk7XG4gIHRoaXMuc29ydEdyYXBoc0J5SW5kZXgoKTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbiAgcmV0dXJuIGdyYXBoO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFNvcnQgdGhlIGdyYXBoIGJ5IGluZGV4XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLnNvcnRHcmFwaHNCeUluZGV4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIGdyYXBocy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEuaW5kZXggPiBiLmluZGV4KSByZXR1cm4gMTtcbiAgICBpZiAoYS5pbmRleCA9PT0gYi5pbmRleCkgcmV0dXJuIDA7XG4gICAgaWYgKGEuaW5kZXggPCBiLmluZGV4KSByZXR1cm4gLTE7XG4gIH0pO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uICAgICAgICAgRGVsZXRlIGdyYXBoIGluIHJlbmRlclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggVGhlIGdyYXBoIHRvIGJlIGRlbGV0ZWRcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gIFZvaWRcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmRlbEdyYXBoID0gZnVuY3Rpb24gKGdyYXBoKSB7XG4gIGlmICh0eXBlb2YgZ3JhcGguZGVsUHJvY2Vzc29yICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gIGdyYXBoLmRlbFByb2Nlc3Nvcih0aGlzKTtcbiAgdGhpcy5ncmFwaHMgPSB0aGlzLmdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9KTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgRGVsZXRlIGFsbCBncmFwaCBpbiByZW5kZXJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuZGVsQWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5ncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZGVsUHJvY2Vzc29yKF90aGlzKTtcbiAgfSk7XG4gIHRoaXMuZ3JhcGhzID0gdGhpcy5ncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaDtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gICAgICAgIERyYXcgYWxsIHRoZSBncmFwaHMgaW4gdGhlIHJlbmRlclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5kcmF3QWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gIHRoaXMuY2xlYXJBcmVhKCk7XG4gIHRoaXMuZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggJiYgZ3JhcGgudmlzaWJsZTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZHJhd1Byb2Nlc3NvcihfdGhpczIsIGdyYXBoKTtcbiAgfSk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gICAgICBBbmltYXRlIHRoZSBncmFwaCB3aG9zZSBhbmltYXRpb24gcXVldWUgaXMgbm90IGVtcHR5XG4gKiAgICAgICAgICAgICAgICAgICBhbmQgdGhlIGFuaW1hdGlvblBhdXNlIGlzIGVxdWFsIHRvIGZhbHNlXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBbmltYXRpb24gUHJvbWlzZVxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUubGF1bmNoQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMzID0gdGhpcztcblxuICB2YXIgYW5pbWF0aW9uU3RhdHVzID0gdGhpcy5hbmltYXRpb25TdGF0dXM7XG4gIGlmIChhbmltYXRpb25TdGF0dXMpIHJldHVybjtcbiAgdGhpcy5hbmltYXRpb25TdGF0dXMgPSB0cnVlO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBhbmltYXRpb24uY2FsbChfdGhpczMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzMy5hbmltYXRpb25TdGF0dXMgPSBmYWxzZTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9LCBEYXRlLm5vdygpKTtcbiAgfSk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gVHJ5IHRvIGFuaW1hdGUgZXZlcnkgZ3JhcGhcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGluIGFuaW1hdGlvbiBlbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lU3RhbXAgIFRpbWUgc3RhbXAgb2YgYW5pbWF0aW9uIHN0YXJ0XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIGFuaW1hdGlvbihjYWxsYmFjaywgdGltZVN0YW1wKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcblxuICBpZiAoIWFuaW1hdGlvbkFibGUoZ3JhcGhzKSkge1xuICAgIGNhbGxiYWNrKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnR1cm5OZXh0QW5pbWF0aW9uRnJhbWUodGltZVN0YW1wKTtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRpb24uYmluZCh0aGlzLCBjYWxsYmFjaywgdGltZVN0YW1wKSk7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBGaW5kIGlmIHRoZXJlIGFyZSBncmFwaCB0aGF0IGNhbiBiZSBhbmltYXRlZFxuICogQHBhcmFtIHtbR3JhcGhdfSBncmFwaHNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuXG5mdW5jdGlvbiBhbmltYXRpb25BYmxlKGdyYXBocykge1xuICByZXR1cm4gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuICFncmFwaC5hbmltYXRpb25QYXVzZSAmJiBncmFwaC5hbmltYXRpb25GcmFtZVN0YXRlLmxlbmd0aDtcbiAgfSk7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2Vkb3duIGV2ZW50XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlRG93bihlKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGhvdmVyR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnaG92ZXInO1xuICB9KTtcbiAgaWYgKCFob3ZlckdyYXBoKSByZXR1cm47XG4gIGhvdmVyR3JhcGguc3RhdHVzID0gJ2FjdGl2ZSc7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2Vtb3ZlIGV2ZW50XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlTW92ZShlKSB7XG4gIHZhciBvZmZzZXRYID0gZS5vZmZzZXRYLFxuICAgICAgb2Zmc2V0WSA9IGUub2Zmc2V0WTtcbiAgdmFyIHBvc2l0aW9uID0gW29mZnNldFgsIG9mZnNldFldO1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIHZhciBhY3RpdmVHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdhY3RpdmUnIHx8IGdyYXBoLnN0YXR1cyA9PT0gJ2RyYWcnO1xuICB9KTtcblxuICBpZiAoYWN0aXZlR3JhcGgpIHtcbiAgICBpZiAoIWFjdGl2ZUdyYXBoLmRyYWcpIHJldHVybjtcblxuICAgIGlmICh0eXBlb2YgYWN0aXZlR3JhcGgubW92ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS5lcnJvcignTm8gbW92ZSBtZXRob2QgaXMgcHJvdmlkZWQsIGNhbm5vdCBiZSBkcmFnZ2VkIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2ZUdyYXBoLm1vdmVQcm9jZXNzb3IoZSk7XG4gICAgYWN0aXZlR3JhcGguc3RhdHVzID0gJ2RyYWcnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBob3ZlckdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2hvdmVyJztcbiAgfSk7XG4gIHZhciBob3ZlckFibGVHcmFwaHMgPSBncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5ob3ZlciAmJiAodHlwZW9mIGdyYXBoLmhvdmVyQ2hlY2sgPT09ICdmdW5jdGlvbicgfHwgZ3JhcGguaG92ZXJSZWN0KTtcbiAgfSk7XG4gIHZhciBob3ZlcmVkR3JhcGggPSBob3ZlckFibGVHcmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguaG92ZXJDaGVja1Byb2Nlc3Nvcihwb3NpdGlvbiwgZ3JhcGgpO1xuICB9KTtcblxuICBpZiAoaG92ZXJlZEdyYXBoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBob3ZlcmVkR3JhcGguc3R5bGUuaG92ZXJDdXJzb3I7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gIH1cblxuICB2YXIgaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1biA9IGZhbHNlLFxuICAgICAgaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuID0gZmFsc2U7XG4gIGlmIChob3ZlckdyYXBoKSBob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuID0gdHlwZW9mIGhvdmVyR3JhcGgubW91c2VPdXRlciA9PT0gJ2Z1bmN0aW9uJztcbiAgaWYgKGhvdmVyZWRHcmFwaCkgaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuID0gdHlwZW9mIGhvdmVyZWRHcmFwaC5tb3VzZUVudGVyID09PSAnZnVuY3Rpb24nO1xuICBpZiAoIWhvdmVyZWRHcmFwaCAmJiAhaG92ZXJHcmFwaCkgcmV0dXJuO1xuXG4gIGlmICghaG92ZXJlZEdyYXBoICYmIGhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1bikgaG92ZXJHcmFwaC5tb3VzZU91dGVyKGUsIGhvdmVyR3JhcGgpO1xuICAgIGhvdmVyR3JhcGguc3RhdHVzID0gJ3N0YXRpYyc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGhvdmVyZWRHcmFwaCAmJiBob3ZlcmVkR3JhcGggPT09IGhvdmVyR3JhcGgpIHJldHVybjtcblxuICBpZiAoaG92ZXJlZEdyYXBoICYmICFob3ZlckdyYXBoKSB7XG4gICAgaWYgKGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1bikgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIoZSwgaG92ZXJlZEdyYXBoKTtcbiAgICBob3ZlcmVkR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaG92ZXJlZEdyYXBoICYmIGhvdmVyR3JhcGggJiYgaG92ZXJlZEdyYXBoICE9PSBob3ZlckdyYXBoKSB7XG4gICAgaWYgKGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4pIGhvdmVyR3JhcGgubW91c2VPdXRlcihlLCBob3ZlckdyYXBoKTtcbiAgICBob3ZlckdyYXBoLnN0YXR1cyA9ICdzdGF0aWMnO1xuICAgIGlmIChob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4pIGhvdmVyZWRHcmFwaC5tb3VzZUVudGVyKGUsIGhvdmVyZWRHcmFwaCk7XG4gICAgaG92ZXJlZEdyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG4gIH1cbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXIgb2YgQ1JlbmRlciBtb3VzZXVwIGV2ZW50XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlVXAoZSkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIHZhciBhY3RpdmVHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdhY3RpdmUnO1xuICB9KTtcbiAgdmFyIGRyYWdHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdkcmFnJztcbiAgfSk7XG4gIGlmIChhY3RpdmVHcmFwaCAmJiB0eXBlb2YgYWN0aXZlR3JhcGguY2xpY2sgPT09ICdmdW5jdGlvbicpIGFjdGl2ZUdyYXBoLmNsaWNrKGUsIGFjdGl2ZUdyYXBoKTtcbiAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoICYmIChncmFwaC5zdGF0dXMgPSAnc3RhdGljJyk7XG4gIH0pO1xuICBpZiAoYWN0aXZlR3JhcGgpIGFjdGl2ZUdyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG4gIGlmIChkcmFnR3JhcGgpIGRyYWdHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICBDbG9uZSBHcmFwaFxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggVGhlIHRhcmdldCB0byBiZSBjbG9uZWRcbiAqIEByZXR1cm4ge0dyYXBofSAgICAgIENsb25lZCBncmFwaFxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgdmFyIHN0eWxlID0gZ3JhcGguc3R5bGUuZ2V0U3R5bGUoKTtcblxuICB2YXIgY2xvbmVkR3JhcGggPSBfb2JqZWN0U3ByZWFkKHt9LCBncmFwaCwge1xuICAgIHN0eWxlOiBzdHlsZVxuICB9KTtcblxuICBkZWxldGUgY2xvbmVkR3JhcGgucmVuZGVyO1xuICBjbG9uZWRHcmFwaCA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNsb25lZEdyYXBoLCB0cnVlKTtcbiAgcmV0dXJuIHRoaXMuYWRkKGNsb25lZEdyYXBoKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcmVnZW5lcmF0b3IgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvclwiKSk7XG5cbnZhciBfYXN5bmNUb0dlbmVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3JcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBfc3R5bGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3N0eWxlLmNsYXNzXCIpKTtcblxudmFyIF90cmFuc2l0aW9uID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS90cmFuc2l0aW9uXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgR3JhcGggPSBmdW5jdGlvbiBHcmFwaChncmFwaCwgY29uZmlnKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgR3JhcGgpO1xuICBjb25maWcgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjb25maWcsIHRydWUpO1xuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2VhdGhlciB0byByZW5kZXIgZ3JhcGhcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB2aXNpYmxlID0gdHJ1ZVxuICAgICAqL1xuICAgIHZpc2libGU6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgZHJhZ1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IGRyYWcgPSBmYWxzZVxuICAgICAqL1xuICAgIGRyYWc6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIGhvdmVyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgaG92ZXIgPSBmYWxzZVxuICAgICAqL1xuICAgIGhvdmVyOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCByZW5kZXJpbmcgaW5kZXhcbiAgICAgKiAgR2l2ZSBwcmlvcml0eSB0byBpbmRleCBoaWdoIGdyYXBoIGluIHJlbmRlcmluZ1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGV4YW1wbGUgaW5kZXggPSAxXG4gICAgICovXG4gICAgaW5kZXg6IDEsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGRlbGF5IHRpbWUobXMpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25EZWxheSA9IDBcbiAgICAgKi9cbiAgICBhbmltYXRpb25EZWxheTogMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBOdW1iZXIgb2YgYW5pbWF0aW9uIGZyYW1lc1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSAzMFxuICAgICAqL1xuICAgIGFuaW1hdGlvbkZyYW1lOiAzMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBbmltYXRpb24gZHluYW1pYyBjdXJ2ZSAoU3VwcG9ydGVkIGJ5IHRyYW5zaXRpb24pXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdsaW5lYXInXG4gICAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvVHJhbnNpdGlvblxuICAgICAqL1xuICAgIGFuaW1hdGlvbkN1cnZlOiAnbGluZWFyJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXZWF0aGVyIHRvIHBhdXNlIGdyYXBoIGFuaW1hdGlvblxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvblBhdXNlID0gZmFsc2VcbiAgICAgKi9cbiAgICBhbmltYXRpb25QYXVzZTogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gUmVjdGFuZ3VsYXIgaG92ZXIgZGV0ZWN0aW9uIHpvbmVcbiAgICAgKiAgVXNlIHRoaXMgbWV0aG9kIGZvciBob3ZlciBkZXRlY3Rpb24gZmlyc3RcbiAgICAgKiBAdHlwZSB7TnVsbHxBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBob3ZlclJlY3QgPSBudWxsXG4gICAgICogQGV4YW1wbGUgaG92ZXJSZWN0ID0gWzAsIDAsIDEwMCwgMTAwXSAvLyBbUmVjdCBzdGFydCB4LCB5LCBSZWN0IHdpZHRoLCBoZWlnaHRdXG4gICAgICovXG4gICAgaG92ZXJSZWN0OiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIE1vdXNlIGVudGVyIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258TnVsbH1cbiAgICAgKiBAZGVmYXVsdCBtb3VzZUVudGVyID0gbnVsbFxuICAgICAqL1xuICAgIG1vdXNlRW50ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTW91c2Ugb3V0ZXIgZXZlbnQgaGFuZGxlclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbnxOdWxsfVxuICAgICAqIEBkZWZhdWx0IG1vdXNlT3V0ZXIgPSBudWxsXG4gICAgICovXG4gICAgbW91c2VPdXRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBNb3VzZSBjbGljayBldmVudCBoYW5kbGVyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufE51bGx9XG4gICAgICogQGRlZmF1bHQgY2xpY2sgPSBudWxsXG4gICAgICovXG4gICAgY2xpY2s6IG51bGxcbiAgfTtcbiAgdmFyIGNvbmZpZ0FibGVOb3QgPSB7XG4gICAgc3RhdHVzOiAnc3RhdGljJyxcbiAgICBhbmltYXRpb25Sb290OiBbXSxcbiAgICBhbmltYXRpb25LZXlzOiBbXSxcbiAgICBhbmltYXRpb25GcmFtZVN0YXRlOiBbXSxcbiAgICBjYWNoZToge31cbiAgfTtcbiAgaWYgKCFjb25maWcuc2hhcGUpIGNvbmZpZy5zaGFwZSA9IHt9O1xuICBpZiAoIWNvbmZpZy5zdHlsZSkgY29uZmlnLnN0eWxlID0ge307XG4gIHZhciBzaGFwZSA9IE9iamVjdC5hc3NpZ24oe30sIGdyYXBoLnNoYXBlLCBjb25maWcuc2hhcGUpO1xuICBPYmplY3QuYXNzaWduKGRlZmF1bHRDb25maWcsIGNvbmZpZywgY29uZmlnQWJsZU5vdCk7XG4gIE9iamVjdC5hc3NpZ24odGhpcywgZ3JhcGgsIGRlZmF1bHRDb25maWcpO1xuICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIHRoaXMuc3R5bGUgPSBuZXcgX3N0eWxlW1wiZGVmYXVsdFwiXShjb25maWcuc3R5bGUpO1xuICB0aGlzLmFkZGVkUHJvY2Vzc29yKCk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGFkZGVkXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gR3JhcGg7XG5cbkdyYXBoLnByb3RvdHlwZS5hZGRlZFByb2Nlc3NvciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiB0aGlzLnNldEdyYXBoQ2VudGVyID09PSAnZnVuY3Rpb24nKSB0aGlzLnNldEdyYXBoQ2VudGVyKG51bGwsIHRoaXMpOyAvLyBUaGUgbGlmZSBjeWNsZSAnYWRkZWRcIlxuXG4gIGlmICh0eXBlb2YgdGhpcy5hZGRlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5hZGRlZCh0aGlzKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgZHJhd1xuICogQHBhcmFtIHtDUmVuZGVyfSByZW5kZXIgSW5zdGFuY2Ugb2YgQ1JlbmRlclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggICAgSW5zdGFuY2Ugb2YgR3JhcGhcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmRyYXdQcm9jZXNzb3IgPSBmdW5jdGlvbiAocmVuZGVyLCBncmFwaCkge1xuICB2YXIgY3R4ID0gcmVuZGVyLmN0eDtcbiAgZ3JhcGguc3R5bGUuaW5pdFN0eWxlKGN0eCk7XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEcmF3ID09PSAnZnVuY3Rpb24nKSB0aGlzLmJlZm9yZURyYXcodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguZHJhdyhyZW5kZXIsIGdyYXBoKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRyYXdlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5kcmF3ZWQodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguc3R5bGUucmVzdG9yZVRyYW5zZm9ybShjdHgpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBob3ZlciBjaGVja1xuICogQHBhcmFtIHtBcnJheX0gcG9zaXRpb24gTW91c2UgUG9zaXRpb25cbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoICAgIEluc3RhbmNlIG9mIEdyYXBoXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgaG92ZXIgY2hlY2tcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5ob3ZlckNoZWNrUHJvY2Vzc29yID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBfcmVmKSB7XG4gIHZhciBob3ZlclJlY3QgPSBfcmVmLmhvdmVyUmVjdCxcbiAgICAgIHN0eWxlID0gX3JlZi5zdHlsZSxcbiAgICAgIGhvdmVyQ2hlY2sgPSBfcmVmLmhvdmVyQ2hlY2s7XG4gIHZhciBncmFwaENlbnRlciA9IHN0eWxlLmdyYXBoQ2VudGVyLFxuICAgICAgcm90YXRlID0gc3R5bGUucm90YXRlLFxuICAgICAgc2NhbGUgPSBzdHlsZS5zY2FsZSxcbiAgICAgIHRyYW5zbGF0ZSA9IHN0eWxlLnRyYW5zbGF0ZTtcblxuICBpZiAoZ3JhcGhDZW50ZXIpIHtcbiAgICBpZiAocm90YXRlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRSb3RhdGVQb2ludFBvcykoLXJvdGF0ZSwgcG9zaXRpb24sIGdyYXBoQ2VudGVyKTtcbiAgICBpZiAoc2NhbGUpIHBvc2l0aW9uID0gKDAsIF91dGlsLmdldFNjYWxlUG9pbnRQb3MpKHNjYWxlLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIDEgLyBzO1xuICAgIH0pLCBwb3NpdGlvbiwgZ3JhcGhDZW50ZXIpO1xuICAgIGlmICh0cmFuc2xhdGUpIHBvc2l0aW9uID0gKDAsIF91dGlsLmdldFRyYW5zbGF0ZVBvaW50UG9zKSh0cmFuc2xhdGUubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdiAqIC0xO1xuICAgIH0pLCBwb3NpdGlvbik7XG4gIH1cblxuICBpZiAoaG92ZXJSZWN0KSByZXR1cm4gX3V0aWwuY2hlY2tQb2ludElzSW5SZWN0LmFwcGx5KHZvaWQgMCwgW3Bvc2l0aW9uXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShob3ZlclJlY3QpKSk7XG4gIHJldHVybiBob3ZlckNoZWNrKHBvc2l0aW9uLCB0aGlzKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZSBNb3VzZSBtb3ZlbWVudCBldmVudFxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUubW92ZVByb2Nlc3NvciA9IGZ1bmN0aW9uIChlKSB7XG4gIHRoaXMubW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmJlZm9yZU1vdmUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlTW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLnNldEdyYXBoQ2VudGVyID09PSAnZnVuY3Rpb24nKSB0aGlzLnNldEdyYXBoQ2VudGVyKGUsIHRoaXMpO1xuICBpZiAodHlwZW9mIHRoaXMubW92ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMubW92ZWQoZSwgdGhpcyk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gVXBkYXRlIGdyYXBoIHN0YXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0ck5hbWUgVXBkYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ck5hbWUpIHtcbiAgdmFyIGNoYW5nZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICBpZiAoIWF0dHJOYW1lIHx8IGNoYW5nZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc09iamVjdCA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHRoaXNbYXR0ck5hbWVdKSA9PT0gJ29iamVjdCc7XG4gIGlmIChpc09iamVjdCkgY2hhbmdlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoY2hhbmdlLCB0cnVlKTtcbiAgdmFyIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuXG4gIGlmIChhdHRyTmFtZSA9PT0gJ3N0eWxlJykge1xuICAgIHRoaXMuc3R5bGUudXBkYXRlKGNoYW5nZSk7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXNbYXR0ck5hbWVdLCBjaGFuZ2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXNbYXR0ck5hbWVdID0gY2hhbmdlO1xuICB9XG5cbiAgaWYgKGF0dHJOYW1lID09PSAnaW5kZXgnKSByZW5kZXIuc29ydEdyYXBoc0J5SW5kZXgoKTtcbiAgcmVuZGVyLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFVwZGF0ZSBncmFwaGljcyBzdGF0ZSAod2l0aCBhbmltYXRpb24pXG4gKiAgT25seSBzaGFwZSBhbmQgc3R5bGUgYXR0cmlidXRlcyBhcmUgc3VwcG9ydGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0ck5hbWUgVXBkYXRlZCBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2FpdCAgICBXaGV0aGVyIHRvIHN0b3JlIHRoZSBhbmltYXRpb24gd2FpdGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGUgbmV4dCBhbmltYXRpb24gcmVxdWVzdFxuICogQHJldHVybiB7UHJvbWlzZX0gQW5pbWF0aW9uIFByb21pc2VcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5hbmltYXRpb24gPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICB2YXIgX3JlZjIgPSAoMCwgX2FzeW5jVG9HZW5lcmF0b3IyW1wiZGVmYXVsdFwiXSkoXG4gIC8qI19fUFVSRV9fKi9cbiAgX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUyKGF0dHJOYW1lLCBjaGFuZ2UpIHtcbiAgICB2YXIgd2FpdCxcbiAgICAgICAgY2hhbmdlUm9vdCxcbiAgICAgICAgY2hhbmdlS2V5cyxcbiAgICAgICAgYmVmb3JlU3RhdGUsXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lLFxuICAgICAgICBhbmltYXRpb25DdXJ2ZSxcbiAgICAgICAgYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICAgIHJlbmRlcixcbiAgICAgICAgX2FyZ3MyID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLndyYXAoZnVuY3Rpb24gX2NhbGxlZTIkKF9jb250ZXh0Mikge1xuICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgc3dpdGNoIChfY29udGV4dDIucHJldiA9IF9jb250ZXh0Mi5uZXh0KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgd2FpdCA9IF9hcmdzMi5sZW5ndGggPiAyICYmIF9hcmdzMlsyXSAhPT0gdW5kZWZpbmVkID8gX2FyZ3MyWzJdIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICghKGF0dHJOYW1lICE9PSAnc2hhcGUnICYmIGF0dHJOYW1lICE9PSAnc3R5bGUnKSkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdPbmx5IHN1cHBvcnRlZCBzaGFwZSBhbmQgc3R5bGUgYW5pbWF0aW9uIScpO1xuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIik7XG5cbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBjaGFuZ2UgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjaGFuZ2UsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnc3R5bGUnKSB0aGlzLnN0eWxlLmNvbG9yUHJvY2Vzc29yKGNoYW5nZSk7XG4gICAgICAgICAgICBjaGFuZ2VSb290ID0gdGhpc1thdHRyTmFtZV07XG4gICAgICAgICAgICBjaGFuZ2VLZXlzID0gT2JqZWN0LmtleXMoY2hhbmdlKTtcbiAgICAgICAgICAgIGJlZm9yZVN0YXRlID0ge307XG4gICAgICAgICAgICBjaGFuZ2VLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlU3RhdGVba2V5XSA9IGNoYW5nZVJvb3Rba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lLCBhbmltYXRpb25DdXJ2ZSA9IHRoaXMuYW5pbWF0aW9uQ3VydmUsIGFuaW1hdGlvbkRlbGF5ID0gdGhpcy5hbmltYXRpb25EZWxheTtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSAoMCwgX3RyYW5zaXRpb25bXCJkZWZhdWx0XCJdKShhbmltYXRpb25DdXJ2ZSwgYmVmb3JlU3RhdGUsIGNoYW5nZSwgYW5pbWF0aW9uRnJhbWUsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25Sb290LnB1c2goY2hhbmdlUm9vdCk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbktleXMucHVzaChjaGFuZ2VLZXlzKTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZS5wdXNoKGFuaW1hdGlvbkZyYW1lU3RhdGUpO1xuXG4gICAgICAgICAgICBpZiAoIXdhaXQpIHtcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAxNztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuYWJydXB0KFwicmV0dXJuXCIpO1xuXG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIGlmICghKGFuaW1hdGlvbkRlbGF5ID4gMCkpIHtcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMjA7XG4gICAgICAgICAgICByZXR1cm4gZGVsYXkoYW5pbWF0aW9uRGVsYXkpO1xuXG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIiwgbmV3IFByb21pc2UoXG4gICAgICAgICAgICAvKiNfX1BVUkVfXyovXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciBfcmVmMyA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgICAgICAgICAgICAgLyojX19QVVJFX18qL1xuICAgICAgICAgICAgICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZShyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlJChfY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Lm5leHQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlci5sYXVuY2hBbmltYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgX2NhbGxlZSk7XG4gICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKF94Mykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVmMy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSgpKSk7XG5cbiAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgX2NhbGxlZTIsIHRoaXMpO1xuICB9KSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChfeCwgX3gyKSB7XG4gICAgcmV0dXJuIF9yZWYyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59KCk7XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBFeHRyYWN0IHRoZSBuZXh0IGZyYW1lIG9mIGRhdGEgZnJvbSB0aGUgYW5pbWF0aW9uIHF1ZXVlXG4gKiAgICAgICAgICAgICAgYW5kIHVwZGF0ZSB0aGUgZ3JhcGggc3RhdGVcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLnR1cm5OZXh0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAodGltZVN0YW1wKSB7XG4gIHZhciBhbmltYXRpb25EZWxheSA9IHRoaXMuYW5pbWF0aW9uRGVsYXksXG4gICAgICBhbmltYXRpb25Sb290ID0gdGhpcy5hbmltYXRpb25Sb290LFxuICAgICAgYW5pbWF0aW9uS2V5cyA9IHRoaXMuYW5pbWF0aW9uS2V5cyxcbiAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICBhbmltYXRpb25QYXVzZSA9IHRoaXMuYW5pbWF0aW9uUGF1c2U7XG4gIGlmIChhbmltYXRpb25QYXVzZSkgcmV0dXJuO1xuICBpZiAoRGF0ZS5ub3coKSAtIHRpbWVTdGFtcCA8IGFuaW1hdGlvbkRlbGF5KSByZXR1cm47XG4gIGFuaW1hdGlvblJvb3QuZm9yRWFjaChmdW5jdGlvbiAocm9vdCwgaSkge1xuICAgIGFuaW1hdGlvbktleXNbaV0uZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByb290W2tleV0gPSBhbmltYXRpb25GcmFtZVN0YXRlW2ldWzBdW2tleV07XG4gICAgfSk7XG4gIH0pO1xuICBhbmltYXRpb25GcmFtZVN0YXRlLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlSXRlbSwgaSkge1xuICAgIHN0YXRlSXRlbS5zaGlmdCgpO1xuICAgIHZhciBub0ZyYW1lID0gc3RhdGVJdGVtLmxlbmd0aCA9PT0gMDtcbiAgICBpZiAobm9GcmFtZSkgYW5pbWF0aW9uUm9vdFtpXSA9IG51bGw7XG4gICAgaWYgKG5vRnJhbWUpIGFuaW1hdGlvbktleXNbaV0gPSBudWxsO1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlID0gYW5pbWF0aW9uRnJhbWVTdGF0ZS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXRlLmxlbmd0aDtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uUm9vdCA9IGFuaW1hdGlvblJvb3QuZmlsdGVyKGZ1bmN0aW9uIChyb290KSB7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvbktleXMgPSBhbmltYXRpb25LZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzO1xuICB9KTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTa2lwIHRvIHRoZSBsYXN0IGZyYW1lIG9mIGFuaW1hdGlvblxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuYW5pbWF0aW9uRW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSxcbiAgICAgIGFuaW1hdGlvbktleXMgPSB0aGlzLmFuaW1hdGlvbktleXMsXG4gICAgICBhbmltYXRpb25Sb290ID0gdGhpcy5hbmltYXRpb25Sb290LFxuICAgICAgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gIGFuaW1hdGlvblJvb3QuZm9yRWFjaChmdW5jdGlvbiAocm9vdCwgaSkge1xuICAgIHZhciBjdXJyZW50S2V5cyA9IGFuaW1hdGlvbktleXNbaV07XG4gICAgdmFyIGxhc3RTdGF0ZSA9IGFuaW1hdGlvbkZyYW1lU3RhdGVbaV0ucG9wKCk7XG4gICAgY3VycmVudEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gcm9vdFtrZXldID0gbGFzdFN0YXRlW2tleV07XG4gICAgfSk7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUgPSBbXTtcbiAgdGhpcy5hbmltYXRpb25LZXlzID0gW107XG4gIHRoaXMuYW5pbWF0aW9uUm9vdCA9IFtdO1xuICByZXR1cm4gcmVuZGVyLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFBhdXNlIGFuaW1hdGlvbiBiZWhhdmlvclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUucGF1c2VBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYXR0cignYW5pbWF0aW9uUGF1c2UnLCB0cnVlKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBUcnkgYW5pbWF0aW9uIGJlaGF2aW9yXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5wbGF5QW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gIHRoaXMuYXR0cignYW5pbWF0aW9uUGF1c2UnLCBmYWxzZSk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShcbiAgLyojX19QVVJFX18qL1xuICBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9yZWY0ID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMltcImRlZmF1bHRcIl0pKFxuICAgIC8qI19fUFVSRV9fKi9cbiAgICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTMocmVzb2x2ZSkge1xuICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlMyQoX2NvbnRleHQzKSB7XG4gICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgc3dpdGNoIChfY29udGV4dDMucHJldiA9IF9jb250ZXh0My5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlci5sYXVuY2hBbmltYXRpb24oKTtcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBfY2FsbGVlMyk7XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChfeDQpIHtcbiAgICAgIHJldHVybiBfcmVmNC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0oKSk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGRlbGV0ZVxuICogQHBhcmFtIHtDUmVuZGVyfSByZW5kZXIgSW5zdGFuY2Ugb2YgQ1JlbmRlclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuZGVsUHJvY2Vzc29yID0gZnVuY3Rpb24gKHJlbmRlcikge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBncmFwaHMgPSByZW5kZXIuZ3JhcGhzO1xuICB2YXIgaW5kZXggPSBncmFwaHMuZmluZEluZGV4KGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaCA9PT0gX3RoaXM7XG4gIH0pO1xuICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEZWxldGUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlRGVsZXRlKHRoaXMpO1xuICBncmFwaHMuc3BsaWNlKGluZGV4LCAxLCBudWxsKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRlbGV0ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMuZGVsZXRlZCh0aGlzKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZXR1cm4gYSB0aW1lZCByZWxlYXNlIFByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIFJlbGVhc2UgdGltZVxuICogQHJldHVybiB7UHJvbWlzZX0gQSB0aW1lZCByZWxlYXNlIFByb21pc2VcbiAqL1xuXG5cbmZ1bmN0aW9uIGRlbGF5KHRpbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKTtcbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgU3R5bGUgPSBmdW5jdGlvbiBTdHlsZShzdHlsZSkge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIFN0eWxlKTtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihzdHlsZSk7XG4gIHZhciBkZWZhdWx0U3R5bGUgPSB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggZmlsbCBjb2xvclxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBmaWxsID0gWzAsIDAsIDAsIDFdXG4gICAgICovXG4gICAgZmlsbDogWzAsIDAsIDAsIDFdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggc3Ryb2tlIGNvbG9yXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IHN0cm9rZSA9IFswLCAwLCAwLCAxXVxuICAgICAqL1xuICAgIHN0cm9rZTogWzAsIDAsIDAsIDBdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIE9wYWNpdHkgb2YgZ3JhcGhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IG9wYWNpdHkgPSAxXG4gICAgICovXG4gICAgb3BhY2l0eTogMSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lQ2FwIG9mIEN0eFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgbGluZUNhcCA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBsaW5lQ2FwID0gJ2J1dHQnfCdyb3VuZCd8J3NxdWFyZSdcbiAgICAgKi9cbiAgICBsaW5lQ2FwOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVqb2luIG9mIEN0eFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgbGluZUpvaW4gPSBudWxsXG4gICAgICogQGV4YW1wbGUgbGluZUpvaW4gPSAncm91bmQnfCdiZXZlbCd8J21pdGVyJ1xuICAgICAqL1xuICAgIGxpbmVKb2luOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVEYXNoIG9mIEN0eFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBsaW5lRGFzaCA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBsaW5lRGFzaCA9IFsxMCwgMTBdXG4gICAgICovXG4gICAgbGluZURhc2g6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZURhc2hPZmZzZXQgb2YgQ3R4XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBsaW5lRGFzaE9mZnNldCA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBsaW5lRGFzaE9mZnNldCA9IDEwXG4gICAgICovXG4gICAgbGluZURhc2hPZmZzZXQ6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93Qmx1ciBvZiBDdHhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHNoYWRvd0JsdXIgPSAwXG4gICAgICovXG4gICAgc2hhZG93Qmx1cjogMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBSZ2JhIHZhbHVlIG9mIGdyYXBoIHNoYWRvdyBjb2xvclxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dDb2xvciA9IFswLCAwLCAwLCAwXVxuICAgICAqL1xuICAgIHNoYWRvd0NvbG9yOiBbMCwgMCwgMCwgMF0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93T2Zmc2V0WCBvZiBDdHhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHNoYWRvd09mZnNldFggPSAwXG4gICAgICovXG4gICAgc2hhZG93T2Zmc2V0WDogMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBTaGFkb3dPZmZzZXRZIG9mIEN0eFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgc2hhZG93T2Zmc2V0WSA9IDBcbiAgICAgKi9cbiAgICBzaGFkb3dPZmZzZXRZOiAwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVXaWR0aCBvZiBDdHhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IGxpbmVXaWR0aCA9IDBcbiAgICAgKi9cbiAgICBsaW5lV2lkdGg6IDAsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQ2VudGVyIHBvaW50IG9mIHRoZSBncmFwaFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBncmFwaENlbnRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBncmFwaENlbnRlciA9IFsxMCwgMTBdXG4gICAgICovXG4gICAgZ3JhcGhDZW50ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggc2NhbGVcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgc2NhbGUgPSBudWxsXG4gICAgICogQGV4YW1wbGUgc2NhbGUgPSBbMS41LCAxLjVdXG4gICAgICovXG4gICAgc2NhbGU6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggcm90YXRpb24gZGVncmVlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCByb3RhdGUgPSBudWxsXG4gICAgICogQGV4YW1wbGUgcm90YXRlID0gMTBcbiAgICAgKi9cbiAgICByb3RhdGU6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggdHJhbnNsYXRlIGRpc3RhbmNlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IHRyYW5zbGF0ZSA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSB0cmFuc2xhdGUgPSBbMTAsIDEwXVxuICAgICAqL1xuICAgIHRyYW5zbGF0ZTogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBDdXJzb3Igc3RhdHVzIHdoZW4gaG92ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGhvdmVyQ3Vyc29yID0gJ3BvaW50ZXInXG4gICAgICogQGV4YW1wbGUgaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCd8J3BvaW50ZXInfCdhdXRvJ3wnY3Jvc3NoYWlyJ3wnbW92ZSd8J3dhaXQnfC4uLlxuICAgICAqL1xuICAgIGhvdmVyQ3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBzdHlsZSBvZiBDdHhcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGZvbnRTdHlsZSA9ICdub3JtYWwnXG4gICAgICogQGV4YW1wbGUgZm9udFN0eWxlID0gJ25vcm1hbCd8J2l0YWxpYyd8J29ibGlxdWUnXG4gICAgICovXG4gICAgZm9udFN0eWxlOiAnbm9ybWFsJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHZhcmllbnQgb2YgQ3R4XG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBmb250VmFyaWVudCA9ICdub3JtYWwnXG4gICAgICogQGV4YW1wbGUgZm9udFZhcmllbnQgPSAnbm9ybWFsJ3wnc21hbGwtY2FwcydcbiAgICAgKi9cbiAgICBmb250VmFyaWVudDogJ25vcm1hbCcsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCB3ZWlnaHQgb2YgQ3R4XG4gICAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgZm9udFdlaWdodCA9ICdub3JtYWwnXG4gICAgICogQGV4YW1wbGUgZm9udFdlaWdodCA9ICdub3JtYWwnfCdib2xkJ3wnYm9sZGVyJ3wnbGlnaHRlcid8TnVtYmVyXG4gICAgICovXG4gICAgZm9udFdlaWdodDogJ25vcm1hbCcsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBzaXplIG9mIEN0eFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgZm9udFNpemUgPSAxMFxuICAgICAqL1xuICAgIGZvbnRTaXplOiAxMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IGZhbWlseSBvZiBDdHhcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGZvbnRGYW1pbHkgPSAnQXJpYWwnXG4gICAgICovXG4gICAgZm9udEZhbWlseTogJ0FyaWFsJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBUZXh0QWxpZ24gb2YgQ3R4XG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCB0ZXh0QWxpZ24gPSAnY2VudGVyJ1xuICAgICAqIEBleGFtcGxlIHRleHRBbGlnbiA9ICdzdGFydCd8J2VuZCd8J2xlZnQnfCdyaWdodCd8J2NlbnRlcidcbiAgICAgKi9cbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFRleHRCYXNlbGluZSBvZiBDdHhcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHRleHRCYXNlbGluZSA9ICdtaWRkbGUnXG4gICAgICogQGV4YW1wbGUgdGV4dEJhc2VsaW5lID0gJ3RvcCd8J2JvdHRvbSd8J21pZGRsZSd8J2FscGhhYmV0aWMnfCdoYW5naW5nJ1xuICAgICAqL1xuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZScsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gVGhlIGNvbG9yIHVzZWQgdG8gY3JlYXRlIHRoZSBncmFkaWVudFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudENvbG9yID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50Q29sb3IgPSBbJyMwMDAnLCAnIzExMScsICcjMjIyJ11cbiAgICAgKi9cbiAgICBncmFkaWVudENvbG9yOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IHR5cGVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50VHlwZSA9ICdsaW5lYXInXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRUeXBlID0gJ2xpbmVhcicgfCAncmFkaWFsJ1xuICAgICAqL1xuICAgIGdyYWRpZW50VHlwZTogJ2xpbmVhcicsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhZGllbnQgcGFyYW1zXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50UGFyYW1zID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50UGFyYW1zID0gW3gwLCB5MCwgeDEsIHkxXSAoTGluZWFyIEdyYWRpZW50KVxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50UGFyYW1zID0gW3gwLCB5MCwgcjAsIHgxLCB5MSwgcjFdIChSYWRpYWwgR3JhZGllbnQpXG4gICAgICovXG4gICAgZ3JhZGllbnRQYXJhbXM6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hlbiB0byB1c2UgZ3JhZGllbnRzXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFdpdGggPSAnc3Ryb2tlJ1xuICAgICAqIEBleGFtcGxlIGdyYWRpZW50V2l0aCA9ICdzdHJva2UnIHwgJ2ZpbGwnXG4gICAgICovXG4gICAgZ3JhZGllbnRXaXRoOiAnc3Ryb2tlJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFkaWVudCBjb2xvciBzdG9wc1xuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRTdG9wcyA9ICdhdXRvJ1xuICAgICAqIEBleGFtcGxlIGdyYWRpZW50U3RvcHMgPSAnYXV0bycgfCBbMCwgLjIsIC4zLCAxXVxuICAgICAqL1xuICAgIGdyYWRpZW50U3RvcHM6ICdhdXRvJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBFeHRlbmRlZCBjb2xvciB0aGF0IHN1cHBvcnRzIGFuaW1hdGlvbiB0cmFuc2l0aW9uXG4gICAgICogQHR5cGUge0FycmF5fE9iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBjb2xvcnMgPSBudWxsXG4gICAgICogQGV4YW1wbGUgY29sb3JzID0gWycjMDAwJywgJyMxMTEnLCAnIzIyMicsICdyZWQnIF1cbiAgICAgKiBAZXhhbXBsZSBjb2xvcnMgPSB7IGE6ICcjMDAwJywgYjogJyMxMTEnIH1cbiAgICAgKi9cbiAgICBjb2xvcnM6IG51bGxcbiAgfTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBkZWZhdWx0U3R5bGUsIHN0eWxlKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTZXQgY29sb3JzIHRvIHJnYmEgdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZSBzdHlsZSBjb25maWdcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmV2ZXJzZSBXaGV0aGVyIHRvIHBlcmZvcm0gcmV2ZXJzZSBvcGVyYXRpb25cbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTdHlsZTtcblxuU3R5bGUucHJvdG90eXBlLmNvbG9yUHJvY2Vzc29yID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gIHZhciByZXZlcnNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgdmFyIHByb2Nlc3NvciA9IHJldmVyc2UgPyBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUgOiBfY29sb3IuZ2V0UmdiYVZhbHVlO1xuICB2YXIgY29sb3JQcm9jZXNzb3JLZXlzID0gWydmaWxsJywgJ3N0cm9rZScsICdzaGFkb3dDb2xvciddO1xuICB2YXIgYWxsS2V5cyA9IE9iamVjdC5rZXlzKHN0eWxlKTtcbiAgdmFyIGNvbG9yS2V5cyA9IGFsbEtleXMuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gY29sb3JQcm9jZXNzb3JLZXlzLmZpbmQoZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiBrID09PSBrZXk7XG4gICAgfSk7XG4gIH0pO1xuICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHN0eWxlW2tleV0gPSBwcm9jZXNzb3Ioc3R5bGVba2V5XSk7XG4gIH0pO1xuICB2YXIgZ3JhZGllbnRDb2xvciA9IHN0eWxlLmdyYWRpZW50Q29sb3IsXG4gICAgICBjb2xvcnMgPSBzdHlsZS5jb2xvcnM7XG4gIGlmIChncmFkaWVudENvbG9yKSBzdHlsZS5ncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gcHJvY2Vzc29yKGMpO1xuICB9KTtcblxuICBpZiAoY29sb3JzKSB7XG4gICAgdmFyIGNvbG9yc0tleXMgPSBPYmplY3Qua2V5cyhjb2xvcnMpO1xuICAgIGNvbG9yc0tleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gY29sb3JzW2tleV0gPSBwcm9jZXNzb3IoY29sb3JzW2tleV0pO1xuICAgIH0pO1xuICB9XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gSW5pdCBncmFwaCBzdHlsZVxuICogQHBhcmFtIHtPYmplY3R9IGN0eCBDb250ZXh0IG9mIGNhbnZhc1xuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUuaW5pdFN0eWxlID0gZnVuY3Rpb24gKGN0eCkge1xuICBpbml0VHJhbnNmb3JtKGN0eCwgdGhpcyk7XG4gIGluaXRHcmFwaFN0eWxlKGN0eCwgdGhpcyk7XG4gIGluaXRHcmFkaWVudChjdHgsIHRoaXMpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIEluaXQgY2FudmFzIHRyYW5zZm9ybVxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIGluaXRUcmFuc2Zvcm0oY3R4LCBzdHlsZSkge1xuICBjdHguc2F2ZSgpO1xuICB2YXIgZ3JhcGhDZW50ZXIgPSBzdHlsZS5ncmFwaENlbnRlcixcbiAgICAgIHJvdGF0ZSA9IHN0eWxlLnJvdGF0ZSxcbiAgICAgIHNjYWxlID0gc3R5bGUuc2NhbGUsXG4gICAgICB0cmFuc2xhdGUgPSBzdHlsZS50cmFuc2xhdGU7XG4gIGlmICghKGdyYXBoQ2VudGVyIGluc3RhbmNlb2YgQXJyYXkpKSByZXR1cm47XG4gIGN0eC50cmFuc2xhdGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdyYXBoQ2VudGVyKSk7XG4gIGlmIChyb3RhdGUpIGN0eC5yb3RhdGUocm90YXRlICogTWF0aC5QSSAvIDE4MCk7XG4gIGlmIChzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSBjdHguc2NhbGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNjYWxlKSk7XG4gIGlmICh0cmFuc2xhdGUpIGN0eC50cmFuc2xhdGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHRyYW5zbGF0ZSkpO1xuICBjdHgudHJhbnNsYXRlKC1ncmFwaENlbnRlclswXSwgLWdyYXBoQ2VudGVyWzFdKTtcbn1cblxudmFyIGF1dG9TZXRTdHlsZUtleXMgPSBbJ2xpbmVDYXAnLCAnbGluZUpvaW4nLCAnbGluZURhc2hPZmZzZXQnLCAnc2hhZG93T2Zmc2V0WCcsICdzaGFkb3dPZmZzZXRZJywgJ2xpbmVXaWR0aCcsICd0ZXh0QWxpZ24nLCAndGV4dEJhc2VsaW5lJ107XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIHN0eWxlIG9mIGNhbnZhcyBjdHhcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuZnVuY3Rpb24gaW5pdEdyYXBoU3R5bGUoY3R4LCBzdHlsZSkge1xuICB2YXIgZmlsbCA9IHN0eWxlLmZpbGwsXG4gICAgICBzdHJva2UgPSBzdHlsZS5zdHJva2UsXG4gICAgICBzaGFkb3dDb2xvciA9IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgb3BhY2l0eSA9IHN0eWxlLm9wYWNpdHk7XG4gIGF1dG9TZXRTdHlsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGtleSB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykgY3R4W2tleV0gPSBzdHlsZVtrZXldO1xuICB9KTtcbiAgZmlsbCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZmlsbCk7XG4gIHN0cm9rZSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc3Ryb2tlKTtcbiAgc2hhZG93Q29sb3IgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNoYWRvd0NvbG9yKTtcbiAgZmlsbFszXSAqPSBvcGFjaXR5O1xuICBzdHJva2VbM10gKj0gb3BhY2l0eTtcbiAgc2hhZG93Q29sb3JbM10gKj0gb3BhY2l0eTtcbiAgY3R4LmZpbGxTdHlsZSA9ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGZpbGwpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzdHJva2UpO1xuICBjdHguc2hhZG93Q29sb3IgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzaGFkb3dDb2xvcik7XG4gIHZhciBsaW5lRGFzaCA9IHN0eWxlLmxpbmVEYXNoLFxuICAgICAgc2hhZG93Qmx1ciA9IHN0eWxlLnNoYWRvd0JsdXI7XG5cbiAgaWYgKGxpbmVEYXNoKSB7XG4gICAgbGluZURhc2ggPSBsaW5lRGFzaC5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2ID49IDAgPyB2IDogMDtcbiAgICB9KTtcbiAgICBjdHguc2V0TGluZURhc2gobGluZURhc2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzaGFkb3dCbHVyID09PSAnbnVtYmVyJykgY3R4LnNoYWRvd0JsdXIgPSBzaGFkb3dCbHVyID4gMCA/IHNoYWRvd0JsdXIgOiAwLjAwMTtcbiAgdmFyIGZvbnRTdHlsZSA9IHN0eWxlLmZvbnRTdHlsZSxcbiAgICAgIGZvbnRWYXJpZW50ID0gc3R5bGUuZm9udFZhcmllbnQsXG4gICAgICBmb250V2VpZ2h0ID0gc3R5bGUuZm9udFdlaWdodCxcbiAgICAgIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemUsXG4gICAgICBmb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgY3R4LmZvbnQgPSBmb250U3R5bGUgKyAnICcgKyBmb250VmFyaWVudCArICcgJyArIGZvbnRXZWlnaHQgKyAnICcgKyBmb250U2l6ZSArICdweCcgKyAnICcgKyBmb250RmFtaWx5O1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gU2V0IHRoZSBncmFkaWVudCBjb2xvciBvZiBjYW52YXMgY3R4XG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuZnVuY3Rpb24gaW5pdEdyYWRpZW50KGN0eCwgc3R5bGUpIHtcbiAgaWYgKCFncmFkaWVudFZhbGlkYXRvcihzdHlsZSkpIHJldHVybjtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgZ3JhZGllbnRQYXJhbXMgPSBzdHlsZS5ncmFkaWVudFBhcmFtcyxcbiAgICAgIGdyYWRpZW50VHlwZSA9IHN0eWxlLmdyYWRpZW50VHlwZSxcbiAgICAgIGdyYWRpZW50V2l0aCA9IHN0eWxlLmdyYWRpZW50V2l0aCxcbiAgICAgIGdyYWRpZW50U3RvcHMgPSBzdHlsZS5ncmFkaWVudFN0b3BzLFxuICAgICAgb3BhY2l0eSA9IHN0eWxlLm9wYWNpdHk7XG4gIGdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoY29sb3IpIHtcbiAgICB2YXIgY29sb3JPcGFjaXR5ID0gY29sb3JbM10gKiBvcGFjaXR5O1xuICAgIHZhciBjbG9uZWRDb2xvciA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY29sb3IpO1xuICAgIGNsb25lZENvbG9yWzNdID0gY29sb3JPcGFjaXR5O1xuICAgIHJldHVybiBjbG9uZWRDb2xvcjtcbiAgfSk7XG4gIGdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShjKTtcbiAgfSk7XG4gIGlmIChncmFkaWVudFN0b3BzID09PSAnYXV0bycpIGdyYWRpZW50U3RvcHMgPSBnZXRBdXRvQ29sb3JTdG9wcyhncmFkaWVudENvbG9yKTtcbiAgdmFyIGdyYWRpZW50ID0gY3R4W1wiY3JlYXRlXCIuY29uY2F0KGdyYWRpZW50VHlwZS5zbGljZSgwLCAxKS50b1VwcGVyQ2FzZSgpICsgZ3JhZGllbnRUeXBlLnNsaWNlKDEpLCBcIkdyYWRpZW50XCIpXS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZ3JhZGllbnRQYXJhbXMpKTtcbiAgZ3JhZGllbnRTdG9wcy5mb3JFYWNoKGZ1bmN0aW9uIChzdG9wLCBpKSB7XG4gICAgcmV0dXJuIGdyYWRpZW50LmFkZENvbG9yU3RvcChzdG9wLCBncmFkaWVudENvbG9yW2ldKTtcbiAgfSk7XG4gIGN0eFtcIlwiLmNvbmNhdChncmFkaWVudFdpdGgsIFwiU3R5bGVcIildID0gZ3JhZGllbnQ7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgZ3JhZGllbnQgY29uZmlndXJhdGlvbiBpcyBsZWdhbFxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59IENoZWNrIFJlc3VsdFxuICovXG5cblxuZnVuY3Rpb24gZ3JhZGllbnRWYWxpZGF0b3Ioc3R5bGUpIHtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgZ3JhZGllbnRQYXJhbXMgPSBzdHlsZS5ncmFkaWVudFBhcmFtcyxcbiAgICAgIGdyYWRpZW50VHlwZSA9IHN0eWxlLmdyYWRpZW50VHlwZSxcbiAgICAgIGdyYWRpZW50V2l0aCA9IHN0eWxlLmdyYWRpZW50V2l0aCxcbiAgICAgIGdyYWRpZW50U3RvcHMgPSBzdHlsZS5ncmFkaWVudFN0b3BzO1xuICBpZiAoIWdyYWRpZW50Q29sb3IgfHwgIWdyYWRpZW50UGFyYW1zKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc29sZS53YXJuKCdUaGUgZ3JhZGllbnQgbmVlZHMgdG8gcHJvdmlkZSBhdCBsZWFzdCB0d28gY29sb3JzJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50VHlwZSAhPT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRUeXBlICE9PSAncmFkaWFsJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRUeXBlIG9ubHkgc3VwcG9ydHMgbGluZWFyIG9yIHJhZGlhbCwgY3VycmVudCB2YWx1ZSBpcyAnICsgZ3JhZGllbnRUeXBlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZ3JhZGllbnRQYXJhbXNMZW5ndGggPSBncmFkaWVudFBhcmFtcy5sZW5ndGg7XG5cbiAgaWYgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRQYXJhbXNMZW5ndGggIT09IDQgfHwgZ3JhZGllbnRUeXBlID09PSAncmFkaWFsJyAmJiBncmFkaWVudFBhcmFtc0xlbmd0aCAhPT0gNikge1xuICAgIGNvbnNvbGUud2FybignVGhlIGV4cGVjdGVkIGxlbmd0aCBvZiBncmFkaWVudFBhcmFtcyBpcyAnICsgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgPyAnNCcgOiAnNicpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZ3JhZGllbnRXaXRoICE9PSAnZmlsbCcgJiYgZ3JhZGllbnRXaXRoICE9PSAnc3Ryb2tlJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRXaXRoIG9ubHkgc3VwcG9ydHMgZmlsbCBvciBzdHJva2UsIGN1cnJlbnQgdmFsdWUgaXMgJyArIGdyYWRpZW50V2l0aCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50U3RvcHMgIT09ICdhdXRvJyAmJiAhKGdyYWRpZW50U3RvcHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLndhcm4oXCJncmFkaWVudFN0b3BzIG9ubHkgc3VwcG9ydHMgJ2F1dG8nIG9yIE51bWJlciBBcnJheSAoWzAsIC41LCAxXSksIGN1cnJlbnQgdmFsdWUgaXMgXCIgKyBncmFkaWVudFN0b3BzKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdldCBhIHVuaWZvcm0gZ3JhZGllbnQgY29sb3Igc3RvcFxuICogQHBhcmFtIHtBcnJheX0gY29sb3IgR3JhZGllbnQgY29sb3JcbiAqIEByZXR1cm4ge0FycmF5fSBHcmFkaWVudCBjb2xvciBzdG9wXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRBdXRvQ29sb3JTdG9wcyhjb2xvcikge1xuICB2YXIgc3RvcEdhcCA9IDEgLyAoY29sb3IubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBjb2xvci5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBzdG9wR2FwICogaTtcbiAgfSk7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZXN0b3JlIGNhbnZhcyBjdHggdHJhbnNmb3JtXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUucmVzdG9yZVRyYW5zZm9ybSA9IGZ1bmN0aW9uIChjdHgpIHtcbiAgY3R4LnJlc3RvcmUoKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgc3R5bGUgZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGNoYW5nZSBDaGFuZ2VkIGRhdGFcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjaGFuZ2UpO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGNoYW5nZSk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjdXJyZW50IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAqIEByZXR1cm4ge09iamVjdH0gU3R5bGUgY29uZmlndXJhdGlvblxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLmdldFN0eWxlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2xvbmVkU3R5bGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKSh0aGlzLCB0cnVlKTtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjbG9uZWRTdHlsZSwgdHJ1ZSk7XG4gIHJldHVybiBjbG9uZWRTdHlsZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5leHRlbmROZXdHcmFwaCA9IGV4dGVuZE5ld0dyYXBoO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBleHBvcnRzLnRleHQgPSBleHBvcnRzLmJlemllckN1cnZlID0gZXhwb3J0cy5zbW9vdGhsaW5lID0gZXhwb3J0cy5wb2x5bGluZSA9IGV4cG9ydHMucmVnUG9seWdvbiA9IGV4cG9ydHMuc2VjdG9yID0gZXhwb3J0cy5hcmMgPSBleHBvcnRzLnJpbmcgPSBleHBvcnRzLnJlY3QgPSBleHBvcnRzLmVsbGlwc2UgPSBleHBvcnRzLmNpcmNsZSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfYmV6aWVyQ3VydmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY2FudmFzID0gcmVxdWlyZShcIi4uL3BsdWdpbi9jYW52YXNcIik7XG5cbnZhciBwb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmUyW1wiZGVmYXVsdFwiXS5wb2x5bGluZVRvQmV6aWVyQ3VydmUsXG4gICAgYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gX2JlemllckN1cnZlMltcImRlZmF1bHRcIl0uYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xudmFyIGNpcmNsZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcblxuICAgIGlmICh0eXBlb2YgcnggIT09ICdudW1iZXInIHx8IHR5cGVvZiByeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHIgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDaXJjbGUgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5DaXJjbGUpKHBvc2l0aW9uLCByeCwgcnksIHIpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNS5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY2LCBfcmVmNykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNi5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY2Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNy5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmNpcmNsZSA9IGNpcmNsZTtcbnZhciBlbGxpcHNlID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGhyOiAwLFxuICAgIHZyOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjguc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiBociAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHZyICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignRWxsaXBzZSBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY5LCBfcmVmMTApIHtcbiAgICB2YXIgY3R4ID0gX3JlZjkuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMC5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG4gICAgY3R4LmVsbGlwc2UocngsIHJ5LCBociA+IDAgPyBociA6IDAuMDEsIHZyID4gMCA/IHZyIDogMC4wMSwgMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjExKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjExLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBociA9IHNoYXBlLmhyLFxuICAgICAgICB2ciA9IHNoYXBlLnZyO1xuICAgIHZhciBhID0gTWF0aC5tYXgoaHIsIHZyKTtcbiAgICB2YXIgYiA9IE1hdGgubWluKGhyLCB2cik7XG4gICAgdmFyIGMgPSBNYXRoLnNxcnQoYSAqIGEgLSBiICogYik7XG4gICAgdmFyIGxlZnRGb2N1c1BvaW50ID0gW3J4IC0gYywgcnldO1xuICAgIHZhciByaWdodEZvY3VzUG9pbnQgPSBbcnggKyBjLCByeV07XG4gICAgdmFyIGRpc3RhbmNlID0gKDAsIF91dGlsLmdldFR3b1BvaW50RGlzdGFuY2UpKHBvc2l0aW9uLCBsZWZ0Rm9jdXNQb2ludCkgKyAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIHJpZ2h0Rm9jdXNQb2ludCk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IDIgKiBhO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjEyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEyLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxMi5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYxMywgX3JlZjE0KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYxMy5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYxMy5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE0LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuZWxsaXBzZSA9IGVsbGlwc2U7XG52YXIgcmVjdCA9IHtcbiAgc2hhcGU6IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgdzogMCxcbiAgICBoOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYxNSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNS5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG5cbiAgICBpZiAodHlwZW9mIHggIT09ICdudW1iZXInIHx8IHR5cGVvZiB5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdyAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZWN0IHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjE2LCBfcmVmMTcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjE2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTcuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICBjdHgucmVjdCh4LCB5LCB3LCBoKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYxOCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOC5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblJlY3QpKHBvc2l0aW9uLCB4LCB5LCB3LCBoKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYxOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMTkuc3R5bGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3ggKyB3IC8gMiwgeSArIGggLyAyXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMjAsIF9yZWYyMSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMjAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMjAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMS5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgeDogc2hhcGUueCArIG1vdmVtZW50WCxcbiAgICAgIHk6IHNoYXBlLnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucmVjdCA9IHJlY3Q7XG52YXIgcmluZyA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYyMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMi5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiByICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignUmluZyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYyMywgX3JlZjI0KSB7XG4gICAgdmFyIGN0eCA9IF9yZWYyMy5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI0LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI1LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuICAgIHZhciBoYWxmTGluZVdpZHRoID0gbGluZVdpZHRoIC8gMjtcbiAgICB2YXIgbWluRGlzdGFuY2UgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgbWF4RGlzdGFuY2UgPSByICsgaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgZGlzdGFuY2UgPSAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIFtyeCwgcnldKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPj0gbWluRGlzdGFuY2UgJiYgZGlzdGFuY2UgPD0gbWF4RGlzdGFuY2U7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMjYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI2LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjI3LCBfcmVmMjgpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjI3Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjI3Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjguc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yaW5nID0gcmluZztcbnZhciBhcmMgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMjkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjkuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBcmMgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMzAsIF9yZWYzMSkge1xuICAgIHZhciBjdHggPSBfcmVmMzAuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMS5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAwMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMzIuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICAgIHZhciBpbnNpZGVSYWRpdXMgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgb3V0c2lkZVJhZGl1cyA9IHIgKyBoYWxmTGluZVdpZHRoO1xuICAgIHJldHVybiAhKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luU2VjdG9yKShwb3NpdGlvbiwgcngsIHJ5LCBpbnNpZGVSYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpICYmICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgb3V0c2lkZVJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMzMpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzMuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjMzLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjM0LCBfcmVmMzUpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjM0Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjM0Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzUuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5hcmMgPSBhcmM7XG52YXIgc2VjdG9yID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBjbG9ja1dpc2U6IHRydWVcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjM2KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM2LnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VjdG9yIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjM3LCBfcmVmMzgpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjM3LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzguc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5saW5lVG8ocngsIHJ5KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzOS5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNDApIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDAuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjQwLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjQxLCBfcmVmNDIpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjQxLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjQxLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDIuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiByeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiByeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5zZWN0b3IgPSBzZWN0b3I7XG52YXIgcmVnUG9seWdvbiA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHNpZGU6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjQzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQzLnNoYXBlO1xuICAgIHZhciBzaWRlID0gc2hhcGUuc2lkZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzaWRlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2lkZSA8IDMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gYXQgbGVhc3QgdHJpZ29uIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY0NCwgX3JlZjQ1KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY0NC5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQ1LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY0NS5jYWNoZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzaWRlID0gc2hhcGUuc2lkZTtcblxuICAgIGlmICghY2FjaGUucG9pbnRzIHx8IGNhY2hlLnJ4ICE9PSByeCB8fCBjYWNoZS5yeSAhPT0gcnkgfHwgY2FjaGUuciAhPT0gciB8fCBjYWNoZS5zaWRlICE9PSBzaWRlKSB7XG4gICAgICB2YXIgX3BvaW50cyA9ICgwLCBfdXRpbC5nZXRSZWd1bGFyUG9seWdvblBvaW50cykocngsIHJ5LCByLCBzaWRlKTtcblxuICAgICAgT2JqZWN0LmFzc2lnbihjYWNoZSwge1xuICAgICAgICBwb2ludHM6IF9wb2ludHMsXG4gICAgICAgIHJ4OiByeCxcbiAgICAgICAgcnk6IHJ5LFxuICAgICAgICByOiByLFxuICAgICAgICBzaWRlOiBzaWRlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgICgwLCBfY2FudmFzLmRyYXdQb2x5bGluZVBhdGgpKGN0eCwgcG9pbnRzKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0Nikge1xuICAgIHZhciBjYWNoZSA9IF9yZWY0Ni5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgcG9pbnRzKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY0Nykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNDcuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNDgsIF9yZWY0OSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNDgubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNDgubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY0OS5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNDkuY2FjaGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgY2FjaGUucnggKz0gbW92ZW1lbnRYO1xuICAgIGNhY2hlLnJ5ICs9IG1vdmVtZW50WTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gICAgY2FjaGUucG9pbnRzID0gY2FjaGUucG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjUwKSB7XG4gICAgICB2YXIgX3JlZjUxID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1MCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY1MVswXSxcbiAgICAgICAgICB5ID0gX3JlZjUxWzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yZWdQb2x5Z29uID0gcmVnUG9seWdvbjtcbnZhciBwb2x5bGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNTIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTIuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignUG9seWxpbmUgcG9pbnRzIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNTMsIF9yZWY1NCkge1xuICAgIHZhciBjdHggPSBfcmVmNTMuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NC5zaGFwZSxcbiAgICAgICAgbGluZVdpZHRoID0gX3JlZjU0LnN0eWxlLmxpbmVXaWR0aDtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICBpZiAobGluZVdpZHRoID09PSAxKSBwb2ludHMgPSAoMCwgX3V0aWwuZWxpbWluYXRlQmx1cikocG9pbnRzKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3UG9seWxpbmVQYXRoKShjdHgsIHBvaW50cyk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY1NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIHBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgcG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY1Nikge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1Ni5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTYuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNTcsIF9yZWY1OCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNTcubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNTcubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY1OC5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHZhciBtb3ZlQWZ0ZXJQb2ludHMgPSBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNTkpIHtcbiAgICAgIHZhciBfcmVmNjAgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjU5LCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjYwWzBdLFxuICAgICAgICAgIHkgPSBfcmVmNjBbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvaW50czogbW92ZUFmdGVyUG9pbnRzXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnBvbHlsaW5lID0gcG9seWxpbmU7XG52YXIgc21vb3RobGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNjEpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjEuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU21vb3RobGluZSBwb2ludHMgc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY2MiwgX3JlZjYzKSB7XG4gICAgdmFyIGN0eCA9IF9yZWY2Mi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYzLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY2My5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuXG4gICAgaWYgKCFjYWNoZS5wb2ludHMgfHwgY2FjaGUucG9pbnRzLnRvU3RyaW5nKCkgIT09IHBvaW50cy50b1N0cmluZygpKSB7XG4gICAgICB2YXIgX2JlemllckN1cnZlID0gcG9seWxpbmVUb0JlemllckN1cnZlKHBvaW50cywgY2xvc2UpO1xuXG4gICAgICB2YXIgaG92ZXJQb2ludHMgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmUoX2JlemllckN1cnZlKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBiZXppZXJDdXJ2ZTogX2JlemllckN1cnZlLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBiZXppZXJDdXJ2ZSA9IGNhY2hlLmJlemllckN1cnZlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIGJlemllckN1cnZlLnNsaWNlKDEpLCBiZXppZXJDdXJ2ZVswXSk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY2NCkge1xuICAgIHZhciBjYWNoZSA9IF9yZWY2NC5jYWNoZSxcbiAgICAgICAgc2hhcGUgPSBfcmVmNjQuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjY0LnN0eWxlO1xuICAgIHZhciBob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzO1xuICAgIHZhciBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgaG92ZXJQb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSkocG9zaXRpb24sIGhvdmVyUG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY2NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY2NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNjUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNjYsIF9yZWY2Nykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNjYubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNjYubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY2Ny5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNjcuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICB2YXIgbW92ZUFmdGVyUG9pbnRzID0gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjY4KSB7XG4gICAgICB2YXIgX3JlZjY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY2OCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY2OVswXSxcbiAgICAgICAgICB5ID0gX3JlZjY5WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIGNhY2hlLnBvaW50cyA9IG1vdmVBZnRlclBvaW50cztcblxuICAgIHZhciBfY2FjaGUkYmV6aWVyQ3VydmUkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNhY2hlLmJlemllckN1cnZlWzBdLCAyKSxcbiAgICAgICAgZnggPSBfY2FjaGUkYmV6aWVyQ3VydmUkWzBdLFxuICAgICAgICBmeSA9IF9jYWNoZSRiZXppZXJDdXJ2ZSRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gY2FjaGUuYmV6aWVyQ3VydmUuc2xpY2UoMSk7XG4gICAgY2FjaGUuYmV6aWVyQ3VydmUgPSBbW2Z4ICsgbW92ZW1lbnRYLCBmeSArIG1vdmVtZW50WV1dLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGN1cnZlcy5tYXAoZnVuY3Rpb24gKGN1cnZlKSB7XG4gICAgICByZXR1cm4gY3VydmUubWFwKGZ1bmN0aW9uIChfcmVmNzApIHtcbiAgICAgICAgdmFyIF9yZWY3MSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzAsIDIpLFxuICAgICAgICAgICAgeCA9IF9yZWY3MVswXSxcbiAgICAgICAgICAgIHkgPSBfcmVmNzFbMV07XG5cbiAgICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgY2FjaGUuaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY3Mikge1xuICAgICAgdmFyIF9yZWY3MyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzIsIDIpLFxuICAgICAgICAgIHggPSBfcmVmNzNbMF0sXG4gICAgICAgICAgeSA9IF9yZWY3M1sxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9pbnRzOiBtb3ZlQWZ0ZXJQb2ludHNcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuc21vb3RobGluZSA9IHNtb290aGxpbmU7XG52YXIgYmV6aWVyQ3VydmUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcG9pbnRzOiBbXSxcbiAgICBjbG9zZTogZmFsc2VcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjc0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc0LnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICBpZiAoIShwb2ludHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0JlemllckN1cnZlIHBvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjc1LCBfcmVmNzYpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjc1LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNzYuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjc2LmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG5cbiAgICBpZiAoIWNhY2hlLnBvaW50cyB8fCBjYWNoZS5wb2ludHMudG9TdHJpbmcoKSAhPT0gcG9pbnRzLnRvU3RyaW5nKCkpIHtcbiAgICAgIHZhciBob3ZlclBvaW50cyA9IGJlemllckN1cnZlVG9Qb2x5bGluZShwb2ludHMsIDIwKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIHBvaW50cy5zbGljZSgxKSwgcG9pbnRzWzBdKTtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjc3KSB7XG4gICAgdmFyIGNhY2hlID0gX3JlZjc3LmNhY2hlLFxuICAgICAgICBzaGFwZSA9IF9yZWY3Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNzcuc3R5bGU7XG4gICAgdmFyIGhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHM7XG4gICAgdmFyIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBob3ZlclBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgaG92ZXJQb2ludHMsIGxpbmVXaWR0aCk7XG4gICAgfVxuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjc4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc4LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY3OC5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gcG9pbnRzWzBdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY3OSwgX3JlZjgwKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY3OS5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY3OS5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjgwLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY4MC5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgdmFyIF9wb2ludHMkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50c1swXSwgMiksXG4gICAgICAgIGZ4ID0gX3BvaW50cyRbMF0sXG4gICAgICAgIGZ5ID0gX3BvaW50cyRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gcG9pbnRzLnNsaWNlKDEpO1xuICAgIHZhciBiZXppZXJDdXJ2ZSA9IFtbZnggKyBtb3ZlbWVudFgsIGZ5ICsgbW92ZW1lbnRZXV0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY3VydmVzLm1hcChmdW5jdGlvbiAoY3VydmUpIHtcbiAgICAgIHJldHVybiBjdXJ2ZS5tYXAoZnVuY3Rpb24gKF9yZWY4MSkge1xuICAgICAgICB2YXIgX3JlZjgyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MSwgMiksXG4gICAgICAgICAgICB4ID0gX3JlZjgyWzBdLFxuICAgICAgICAgICAgeSA9IF9yZWY4MlsxXTtcblxuICAgICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgICAgfSk7XG4gICAgfSkpKTtcbiAgICBjYWNoZS5wb2ludHMgPSBiZXppZXJDdXJ2ZTtcbiAgICBjYWNoZS5ob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjgzKSB7XG4gICAgICB2YXIgX3JlZjg0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MywgMiksXG4gICAgICAgICAgeCA9IF9yZWY4NFswXSxcbiAgICAgICAgICB5ID0gX3JlZjg0WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb2ludHM6IGJlemllckN1cnZlXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmJlemllckN1cnZlID0gYmV6aWVyQ3VydmU7XG52YXIgdGV4dCA9IHtcbiAgc2hhcGU6IHtcbiAgICBjb250ZW50OiAnJyxcbiAgICBwb3NpdGlvbjogW10sXG4gICAgbWF4V2lkdGg6IHVuZGVmaW5lZCxcbiAgICByb3dHYXA6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjg1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg1LnNoYXBlO1xuICAgIHZhciBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbixcbiAgICAgICAgcm93R2FwID0gc2hhcGUucm93R2FwO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBjb250ZW50IHNob3VsZCBiZSBhIHN0cmluZyEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIShwb3NpdGlvbiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBwb3NpdGlvbiBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByb3dHYXAgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXh0IHJvd0dhcCBzaG91bGQgYmUgYSBudW1iZXIhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjg2LCBfcmVmODcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjg2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODcuc2hhcGU7XG4gICAgdmFyIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uLFxuICAgICAgICBtYXhXaWR0aCA9IHNoYXBlLm1heFdpZHRoLFxuICAgICAgICByb3dHYXAgPSBzaGFwZS5yb3dHYXA7XG4gICAgdmFyIHRleHRCYXNlbGluZSA9IGN0eC50ZXh0QmFzZWxpbmUsXG4gICAgICAgIGZvbnQgPSBjdHguZm9udDtcbiAgICB2YXIgZm9udFNpemUgPSBwYXJzZUludChmb250LnJlcGxhY2UoL1xcRC9nLCAnJykpO1xuXG4gICAgdmFyIF9wb3NpdGlvbiA9IHBvc2l0aW9uLFxuICAgICAgICBfcG9zaXRpb24yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9wb3NpdGlvbiwgMiksXG4gICAgICAgIHggPSBfcG9zaXRpb24yWzBdLFxuICAgICAgICB5ID0gX3Bvc2l0aW9uMlsxXTtcblxuICAgIGNvbnRlbnQgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcbiAgICB2YXIgcm93TnVtID0gY29udGVudC5sZW5ndGg7XG4gICAgdmFyIGxpbmVIZWlnaHQgPSBmb250U2l6ZSArIHJvd0dhcDtcbiAgICB2YXIgYWxsSGVpZ2h0ID0gcm93TnVtICogbGluZUhlaWdodCAtIHJvd0dhcDtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgIGlmICh0ZXh0QmFzZWxpbmUgPT09ICdtaWRkbGUnKSB7XG4gICAgICBvZmZzZXQgPSBhbGxIZWlnaHQgLyAyO1xuICAgICAgeSArPSBmb250U2l6ZSAvIDI7XG4gICAgfVxuXG4gICAgaWYgKHRleHRCYXNlbGluZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIG9mZnNldCA9IGFsbEhlaWdodDtcbiAgICAgIHkgKz0gZm9udFNpemU7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBuZXcgQXJyYXkocm93TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICByZXR1cm4gW3gsIHkgKyBpICogbGluZUhlaWdodCAtIG9mZnNldF07XG4gICAgfSk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRlbnQuZm9yRWFjaChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgY3R4LmZpbGxUZXh0LmFwcGx5KGN0eCwgW3RleHRdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uW2ldKSwgW21heFdpZHRoXSkpO1xuICAgICAgY3R4LnN0cm9rZVRleHQuYXBwbHkoY3R4LCBbdGV4dF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb25baV0pLCBbbWF4V2lkdGhdKSk7XG4gICAgfSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmODgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODguc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjg4LnN0eWxlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY4OSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4OS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmODkuc3R5bGU7XG4gICAgdmFyIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb247XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uKTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmOTAsIF9yZWY5MSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmOTAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmOTAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY5MS5zaGFwZTtcblxuICAgIHZhciBfc2hhcGUkcG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2hhcGUucG9zaXRpb24sIDIpLFxuICAgICAgICB4ID0gX3NoYXBlJHBvc2l0aW9uWzBdLFxuICAgICAgICB5ID0gX3NoYXBlJHBvc2l0aW9uWzFdO1xuXG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvc2l0aW9uOiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV1cbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG52YXIgZ3JhcGhzID0gbmV3IE1hcChbWydjaXJjbGUnLCBjaXJjbGVdLCBbJ2VsbGlwc2UnLCBlbGxpcHNlXSwgWydyZWN0JywgcmVjdF0sIFsncmluZycsIHJpbmddLCBbJ2FyYycsIGFyY10sIFsnc2VjdG9yJywgc2VjdG9yXSwgWydyZWdQb2x5Z29uJywgcmVnUG9seWdvbl0sIFsncG9seWxpbmUnLCBwb2x5bGluZV0sIFsnc21vb3RobGluZScsIHNtb290aGxpbmVdLCBbJ2JlemllckN1cnZlJywgYmV6aWVyQ3VydmVdLCBbJ3RleHQnLCB0ZXh0XV0pO1xudmFyIF9kZWZhdWx0ID0gZ3JhcGhzO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gRXh0ZW5kIG5ldyBncmFwaFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgICBOYW1lIG9mIEdyYXBoXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2YgR3JhcGhcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxuICovXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7XG5cbmZ1bmN0aW9uIGV4dGVuZE5ld0dyYXBoKG5hbWUsIGNvbmZpZykge1xuICBpZiAoIW5hbWUgfHwgIWNvbmZpZykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0V4dGVuZE5ld0dyYXBoIE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbmZpZy5zaGFwZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlcXVpcmVkIGF0dHJpYnV0ZSBvZiBzaGFwZSB0byBleHRlbmROZXdHcmFwaCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbmZpZy52YWxpZGF0b3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBmdW5jdGlvbiBvZiB2YWxpZGF0b3IgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcuZHJhdykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlcXVpcmVkIGZ1bmN0aW9uIG9mIGRyYXcgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ3JhcGhzLnNldChuYW1lLCBjb25maWcpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNSZW5kZXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NyZW5kZXJbXCJkZWZhdWx0XCJdO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImV4dGVuZE5ld0dyYXBoXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9ncmFwaHMuZXh0ZW5kTmV3R3JhcGg7XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfY3JlbmRlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY2xhc3MvY3JlbmRlci5jbGFzc1wiKSk7XG5cbnZhciBfZ3JhcGhzID0gcmVxdWlyZShcIi4vY29uZmlnL2dyYXBoc1wiKTtcblxudmFyIF9kZWZhdWx0ID0gX2NyZW5kZXJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRyYXdQb2x5bGluZVBhdGggPSBkcmF3UG9seWxpbmVQYXRoO1xuZXhwb3J0cy5kcmF3QmV6aWVyQ3VydmVQYXRoID0gZHJhd0JlemllckN1cnZlUGF0aDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBEcmF3IGEgcG9seWxpbmUgcGF0aFxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgICAgICAgQ2FudmFzIDJkIGNvbnRleHRcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAgICAgIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJlZ2luUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgYmVnaW5QYXRoXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgY2xvc2VQYXRoXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuZnVuY3Rpb24gZHJhd1BvbHlsaW5lUGF0aChjdHgsIHBvaW50cykge1xuICB2YXIgYmVnaW5QYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGNsb3NlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG4gIGlmICghY3R4IHx8IHBvaW50cy5sZW5ndGggPCAyKSByZXR1cm4gZmFsc2U7XG4gIGlmIChiZWdpblBhdGgpIGN0eC5iZWdpblBhdGgoKTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50LCBpKSB7XG4gICAgcmV0dXJuIHBvaW50ICYmIChpID09PSAwID8gY3R4Lm1vdmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQpKSA6IGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50KSkpO1xuICB9KTtcbiAgaWYgKGNsb3NlUGF0aCkgY3R4LmNsb3NlUGF0aCgpO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRHJhdyBhIGJlemllciBjdXJ2ZSBwYXRoXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICAgICAgICBDYW52YXMgMmQgY29udGV4dFxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzICAgICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgYmV6aWVyIGN1cnZlXG4gKiBAcGFyYW0ge0FycmF5fSBtb3ZlVG8gICAgICBUaGUgcG9pbnQgbmVlZCB0byBleGN1dGUgbW92ZVRvXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJlZ2luUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgYmVnaW5QYXRoXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgY2xvc2VQYXRoXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcbiAqL1xuXG5cbmZ1bmN0aW9uIGRyYXdCZXppZXJDdXJ2ZVBhdGgoY3R4LCBwb2ludHMpIHtcbiAgdmFyIG1vdmVUbyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBiZWdpblBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuICB2YXIgY2xvc2VQYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBmYWxzZTtcbiAgaWYgKCFjdHggfHwgIXBvaW50cykgcmV0dXJuIGZhbHNlO1xuICBpZiAoYmVnaW5QYXRoKSBjdHguYmVnaW5QYXRoKCk7XG4gIGlmIChtb3ZlVG8pIGN0eC5tb3ZlVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1vdmVUbykpO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtICYmIGN0eC5iZXppZXJDdXJ2ZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzBdKS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzFdKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzJdKSkpO1xuICB9KTtcbiAgaWYgKGNsb3NlUGF0aCkgY3R4LmNsb3NlUGF0aCgpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGRyYXdQb2x5bGluZVBhdGg6IGRyYXdQb2x5bGluZVBhdGgsXG4gIGRyYXdCZXppZXJDdXJ2ZVBhdGg6IGRyYXdCZXppZXJDdXJ2ZVBhdGhcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVlcENsb25lID0gZGVlcENsb25lO1xuZXhwb3J0cy5lbGltaW5hdGVCbHVyID0gZWxpbWluYXRlQmx1cjtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5DaXJjbGUgPSBjaGVja1BvaW50SXNJbkNpcmNsZTtcbmV4cG9ydHMuZ2V0VHdvUG9pbnREaXN0YW5jZSA9IGdldFR3b1BvaW50RGlzdGFuY2U7XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luUG9seWdvbiA9IGNoZWNrUG9pbnRJc0luUG9seWdvbjtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5TZWN0b3IgPSBjaGVja1BvaW50SXNJblNlY3RvcjtcbmV4cG9ydHMuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lID0gY2hlY2tQb2ludElzTmVhclBvbHlsaW5lO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJblJlY3QgPSBjaGVja1BvaW50SXNJblJlY3Q7XG5leHBvcnRzLmdldFJvdGF0ZVBvaW50UG9zID0gZ2V0Um90YXRlUG9pbnRQb3M7XG5leHBvcnRzLmdldFNjYWxlUG9pbnRQb3MgPSBnZXRTY2FsZVBvaW50UG9zO1xuZXhwb3J0cy5nZXRUcmFuc2xhdGVQb2ludFBvcyA9IGdldFRyYW5zbGF0ZVBvaW50UG9zO1xuZXhwb3J0cy5nZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmUgPSBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmU7XG5leHBvcnRzLmdldENpcmNsZVJhZGlhblBvaW50ID0gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ7XG5leHBvcnRzLmdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzID0gZ2V0UmVndWxhclBvbHlnb25Qb2ludHM7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgc2luID0gTWF0aC5zaW4sXG4gICAgY29zID0gTWF0aC5jb3MsXG4gICAgbWF4ID0gTWF0aC5tYXgsXG4gICAgbWluID0gTWF0aC5taW4sXG4gICAgUEkgPSBNYXRoLlBJO1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ2xvbmUgYW4gb2JqZWN0IG9yIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqZWN0IENsb25lZCBvYmplY3RcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVjdXJzaW9uICAgV2hldGhlciB0byB1c2UgcmVjdXJzaXZlIGNsb25pbmdcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQ2xvbmUgb2JqZWN0XG4gKi9cblxuZnVuY3Rpb24gZGVlcENsb25lKG9iamVjdCkge1xuICB2YXIgcmVjdXJzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgaWYgKCFvYmplY3QpIHJldHVybiBvYmplY3Q7XG4gIHZhciBwYXJzZSA9IEpTT04ucGFyc2UsXG4gICAgICBzdHJpbmdpZnkgPSBKU09OLnN0cmluZ2lmeTtcbiAgaWYgKCFyZWN1cnNpb24pIHJldHVybiBwYXJzZShzdHJpbmdpZnkob2JqZWN0KSk7XG4gIHZhciBjbG9uZWRPYmogPSBvYmplY3QgaW5zdGFuY2VvZiBBcnJheSA/IFtdIDoge307XG5cbiAgaWYgKG9iamVjdCAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShvYmplY3QpID09PSAnb2JqZWN0Jykge1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAob2JqZWN0W2tleV0gJiYgKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkob2JqZWN0W2tleV0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGNsb25lZE9ialtrZXldID0gZGVlcENsb25lKG9iamVjdFtrZXldLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbG9uZWRPYmpba2V5XSA9IG9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNsb25lZE9iajtcbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIEVsaW1pbmF0ZSBsaW5lIGJsdXIgZHVlIHRvIDFweCBsaW5lIHdpZHRoXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgTGluZSBwb2ludHNcbiAqIEByZXR1cm4ge0FycmF5fSBMaW5lIHBvaW50cyBhZnRlciBwcm9jZXNzZWRcbiAqL1xuXG5cbmZ1bmN0aW9uIGVsaW1pbmF0ZUJsdXIocG9pbnRzKSB7XG4gIHJldHVybiBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIF9yZWYyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYsIDIpLFxuICAgICAgICB4ID0gX3JlZjJbMF0sXG4gICAgICAgIHkgPSBfcmVmMlsxXTtcblxuICAgIHJldHVybiBbcGFyc2VJbnQoeCkgKyAwLjUsIHBhcnNlSW50KHkpICsgMC41XTtcbiAgfSk7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBjaXJjbGVcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50IFBvc3Rpb24gb2YgcG9pbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSByeCAgIENpcmNsZSB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByeSAgIENpcmNsZSB5IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByICAgIENpcmNsZSByYWRpdXNcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5DaXJjbGUocG9pbnQsIHJ4LCByeSwgcikge1xuICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgW3J4LCByeV0pIDw9IHI7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuICogQHBhcmFtIHtBcnJheX0gcG9pbnQxIHBvaW50MVxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQyIHBvaW50MlxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFR3b1BvaW50RGlzdGFuY2UoX3JlZjMsIF9yZWY0KSB7XG4gIHZhciBfcmVmNSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMywgMiksXG4gICAgICB4YSA9IF9yZWY1WzBdLFxuICAgICAgeWEgPSBfcmVmNVsxXTtcblxuICB2YXIgX3JlZjYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjQsIDIpLFxuICAgICAgeGIgPSBfcmVmNlswXSxcbiAgICAgIHliID0gX3JlZjZbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGFicyh4YSAtIHhiKTtcbiAgdmFyIG1pbnVzWSA9IGFicyh5YSAtIHliKTtcbiAgcmV0dXJuIHNxcnQobWludXNYICogbWludXNYICsgbWludXNZICogbWludXNZKTtcbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHBvbHlnb25cbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICBQb3N0aW9uIG9mIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgcG9seWxpbmVcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSB7XG4gIHZhciBjb3VudGVyID0gMDtcblxuICB2YXIgX3BvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnRbMF0sXG4gICAgICB5ID0gX3BvaW50WzFdO1xuXG4gIHZhciBwb2ludE51bSA9IHBvbHlnb24ubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAxLCBwMSA9IHBvbHlnb25bMF07IGkgPD0gcG9pbnROdW07IGkrKykge1xuICAgIHZhciBwMiA9IHBvbHlnb25baSAlIHBvaW50TnVtXTtcblxuICAgIGlmICh4ID4gbWluKHAxWzBdLCBwMlswXSkgJiYgeCA8PSBtYXgocDFbMF0sIHAyWzBdKSkge1xuICAgICAgaWYgKHkgPD0gbWF4KHAxWzFdLCBwMlsxXSkpIHtcbiAgICAgICAgaWYgKHAxWzBdICE9PSBwMlswXSkge1xuICAgICAgICAgIHZhciB4aW50ZXJzID0gKHggLSBwMVswXSkgKiAocDJbMV0gLSBwMVsxXSkgLyAocDJbMF0gLSBwMVswXSkgKyBwMVsxXTtcblxuICAgICAgICAgIGlmIChwMVsxXSA9PT0gcDJbMV0gfHwgeSA8PSB4aW50ZXJzKSB7XG4gICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcDEgPSBwMjtcbiAgfVxuXG4gIHJldHVybiBjb3VudGVyICUgMiA9PT0gMTtcbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHNlY3RvclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICAgUG9zdGlvbiBvZiBwb2ludFxuICogQHBhcmFtIHtOdW1iZXJ9IHJ4ICAgICAgICAgU2VjdG9yIHggY29vcmRpbmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJ5ICAgICAgICAgU2VjdG9yIHkgY29vcmRpbmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgICAgICAgU2VjdG9yIHJhZGl1c1xuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0QW5nbGUgU2VjdG9yIHN0YXJ0IGFuZ2xlXG4gKiBAcGFyYW0ge051bWJlcn0gZW5kQW5nbGUgICBTZWN0b3IgZW5kIGFuZ2xlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb2NrV2lzZSBXaGV0aGVyIHRoZSBzZWN0b3IgYW5nbGUgaXMgY2xvY2t3aXNlXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc0luU2VjdG9yKHBvaW50LCByeCwgcnksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgW3J4LCByeV0pID4gcikgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICghY2xvY2tXaXNlKSB7XG4gICAgdmFyIF9kZWVwQ2xvbmUgPSBkZWVwQ2xvbmUoW2VuZEFuZ2xlLCBzdGFydEFuZ2xlXSk7XG5cbiAgICB2YXIgX2RlZXBDbG9uZTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2RlZXBDbG9uZSwgMik7XG5cbiAgICBzdGFydEFuZ2xlID0gX2RlZXBDbG9uZTJbMF07XG4gICAgZW5kQW5nbGUgPSBfZGVlcENsb25lMlsxXTtcbiAgfVxuXG4gIHZhciByZXZlcnNlQkUgPSBzdGFydEFuZ2xlID4gZW5kQW5nbGU7XG5cbiAgaWYgKHJldmVyc2VCRSkge1xuICAgIHZhciBfcmVmNyA9IFtlbmRBbmdsZSwgc3RhcnRBbmdsZV07XG4gICAgc3RhcnRBbmdsZSA9IF9yZWY3WzBdO1xuICAgIGVuZEFuZ2xlID0gX3JlZjdbMV07XG4gIH1cblxuICB2YXIgbWludXMgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG4gIGlmIChtaW51cyA+PSBQSSAqIDIpIHJldHVybiB0cnVlO1xuXG4gIHZhciBfcG9pbnQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQyWzBdLFxuICAgICAgeSA9IF9wb2ludDJbMV07XG5cbiAgdmFyIF9nZXRDaXJjbGVSYWRpYW5Qb2ludCA9IGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgc3RhcnRBbmdsZSksXG4gICAgICBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRDaXJjbGVSYWRpYW5Qb2ludCwgMiksXG4gICAgICBieCA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDJbMF0sXG4gICAgICBieSA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDJbMV07XG5cbiAgdmFyIF9nZXRDaXJjbGVSYWRpYW5Qb2ludDMgPSBnZXRDaXJjbGVSYWRpYW5Qb2ludChyeCwgcnksIHIsIGVuZEFuZ2xlKSxcbiAgICAgIF9nZXRDaXJjbGVSYWRpYW5Qb2ludDQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldENpcmNsZVJhZGlhblBvaW50MywgMiksXG4gICAgICBleCA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDRbMF0sXG4gICAgICBleSA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDRbMV07XG5cbiAgdmFyIHZQb2ludCA9IFt4IC0gcngsIHkgLSByeV07XG4gIHZhciB2QkFybSA9IFtieCAtIHJ4LCBieSAtIHJ5XTtcbiAgdmFyIHZFQXJtID0gW2V4IC0gcngsIGV5IC0gcnldO1xuICB2YXIgcmV2ZXJzZSA9IG1pbnVzID4gUEk7XG5cbiAgaWYgKHJldmVyc2UpIHtcbiAgICB2YXIgX2RlZXBDbG9uZTMgPSBkZWVwQ2xvbmUoW3ZFQXJtLCB2QkFybV0pO1xuXG4gICAgdmFyIF9kZWVwQ2xvbmU0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9kZWVwQ2xvbmUzLCAyKTtcblxuICAgIHZCQXJtID0gX2RlZXBDbG9uZTRbMF07XG4gICAgdkVBcm0gPSBfZGVlcENsb25lNFsxXTtcbiAgfVxuXG4gIHZhciBpblNlY3RvciA9IGlzQ2xvY2tXaXNlKHZCQXJtLCB2UG9pbnQpICYmICFpc0Nsb2NrV2lzZSh2RUFybSwgdlBvaW50KTtcbiAgaWYgKHJldmVyc2UpIGluU2VjdG9yID0gIWluU2VjdG9yO1xuICBpZiAocmV2ZXJzZUJFKSBpblNlY3RvciA9ICFpblNlY3RvcjtcbiAgcmV0dXJuIGluU2VjdG9yO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gRGV0ZXJtaW5lIGlmIHRoZSBwb2ludCBpcyBpbiB0aGUgY2xvY2t3aXNlIGRpcmVjdGlvbiBvZiB0aGUgdmVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSB2QXJtICAgVmVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSB2UG9pbnQgUG9pbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xuICovXG5cblxuZnVuY3Rpb24gaXNDbG9ja1dpc2UodkFybSwgdlBvaW50KSB7XG4gIHZhciBfdkFybSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh2QXJtLCAyKSxcbiAgICAgIGF4ID0gX3ZBcm1bMF0sXG4gICAgICBheSA9IF92QXJtWzFdO1xuXG4gIHZhciBfdlBvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHZQb2ludCwgMiksXG4gICAgICBweCA9IF92UG9pbnRbMF0sXG4gICAgICBweSA9IF92UG9pbnRbMV07XG5cbiAgcmV0dXJuIC1heSAqIHB4ICsgYXggKiBweSA+IDA7XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBwb2x5bGluZVxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICBQb3N0aW9uIG9mIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSAgIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXG4gKiBAcGFyYW0ge051bWJlcn0gbGluZVdpZHRoIFBvbHlsaW5lIGxpbmV3aWR0aFxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNOZWFyUG9seWxpbmUocG9pbnQsIHBvbHlsaW5lLCBsaW5lV2lkdGgpIHtcbiAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICB2YXIgbW92ZVVwUG9seWxpbmUgPSBwb2x5bGluZS5tYXAoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIF9yZWY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4LCAyKSxcbiAgICAgICAgeCA9IF9yZWY5WzBdLFxuICAgICAgICB5ID0gX3JlZjlbMV07XG5cbiAgICByZXR1cm4gW3gsIHkgLSBoYWxmTGluZVdpZHRoXTtcbiAgfSk7XG4gIHZhciBtb3ZlRG93blBvbHlsaW5lID0gcG9seWxpbmUubWFwKGZ1bmN0aW9uIChfcmVmMTApIHtcbiAgICB2YXIgX3JlZjExID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMCwgMiksXG4gICAgICAgIHggPSBfcmVmMTFbMF0sXG4gICAgICAgIHkgPSBfcmVmMTFbMV07XG5cbiAgICByZXR1cm4gW3gsIHkgKyBoYWxmTGluZVdpZHRoXTtcbiAgfSk7XG4gIHZhciBwb2x5Z29uID0gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobW92ZVVwUG9seWxpbmUpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1vdmVEb3duUG9seWxpbmUucmV2ZXJzZSgpKSk7XG4gIHJldHVybiBjaGVja1BvaW50SXNJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcmVjdFxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICBQb3N0aW9uIG9mIHBvaW50XG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgIFJlY3Qgc3RhcnQgeCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge051bWJlcn0geSAgICAgIFJlY3Qgc3RhcnQgeSBjb29yZGluYXRlXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGggIFJlY3Qgd2lkdGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgUmVjdCBoZWlnaHRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5SZWN0KF9yZWYxMiwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgX3JlZjEzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICBweCA9IF9yZWYxM1swXSxcbiAgICAgIHB5ID0gX3JlZjEzWzFdO1xuXG4gIGlmIChweCA8IHgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5IDwgeSkgcmV0dXJuIGZhbHNlO1xuICBpZiAocHggPiB4ICsgd2lkdGgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5ID4geSArIGhlaWdodCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHJvdGF0ZWQgcG9pbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSByb3RhdGUgRGVncmVlIG9mIHJvdGF0aW9uXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgIFBvc3Rpb24gb2YgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXl9IG9yaWdpbiAgUm90YXRpb24gY2VudGVyXG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW4gIFJvdGF0aW9uIGNlbnRlclxuICogQHJldHVybiB7TnVtYmVyfSBDb29yZGluYXRlcyBhZnRlciByb3RhdGlvblxuICovXG5cblxuZnVuY3Rpb24gZ2V0Um90YXRlUG9pbnRQb3MoKSB7XG4gIHZhciByb3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XG4gIHZhciBwb2ludCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICB2YXIgb3JpZ2luID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbMCwgMF07XG4gIGlmICghcG9pbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKHJvdGF0ZSAlIDM2MCA9PT0gMCkgcmV0dXJuIHBvaW50O1xuXG4gIHZhciBfcG9pbnQzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQzWzBdLFxuICAgICAgeSA9IF9wb2ludDNbMV07XG5cbiAgdmFyIF9vcmlnaW4gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkob3JpZ2luLCAyKSxcbiAgICAgIG94ID0gX29yaWdpblswXSxcbiAgICAgIG95ID0gX29yaWdpblsxXTtcblxuICByb3RhdGUgKj0gUEkgLyAxODA7XG4gIHJldHVybiBbKHggLSBveCkgKiBjb3Mocm90YXRlKSAtICh5IC0gb3kpICogc2luKHJvdGF0ZSkgKyBveCwgKHggLSBveCkgKiBzaW4ocm90YXRlKSArICh5IC0gb3kpICogY29zKHJvdGF0ZSkgKyBveV07XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzY2FsZWQgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXl9IHNjYWxlICBTY2FsZSBmYWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICBQb3N0aW9uIG9mIHBvaW50XG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW4gU2NhbGUgY2VudGVyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHNjYWxlXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTY2FsZVBvaW50UG9zKCkge1xuICB2YXIgc2NhbGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFsxLCAxXTtcbiAgdmFyIHBvaW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gIHZhciBvcmlnaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFswLCAwXTtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoc2NhbGUgPT09IDEpIHJldHVybiBwb2ludDtcblxuICB2YXIgX3BvaW50NCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50NFswXSxcbiAgICAgIHkgPSBfcG9pbnQ0WzFdO1xuXG4gIHZhciBfb3JpZ2luMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShvcmlnaW4sIDIpLFxuICAgICAgb3ggPSBfb3JpZ2luMlswXSxcbiAgICAgIG95ID0gX29yaWdpbjJbMV07XG5cbiAgdmFyIF9zY2FsZSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShzY2FsZSwgMiksXG4gICAgICB4cyA9IF9zY2FsZVswXSxcbiAgICAgIHlzID0gX3NjYWxlWzFdO1xuXG4gIHZhciByZWxhdGl2ZVBvc1ggPSB4IC0gb3g7XG4gIHZhciByZWxhdGl2ZVBvc1kgPSB5IC0gb3k7XG4gIHJldHVybiBbcmVsYXRpdmVQb3NYICogeHMgKyBveCwgcmVsYXRpdmVQb3NZICogeXMgKyBveV07XG59XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzY2FsZWQgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXl9IHRyYW5zbGF0ZSBUcmFuc2xhdGlvbiBkaXN0YW5jZVxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgIFBvc3Rpb24gb2YgcG9pbnRcbiAqIEByZXR1cm4ge051bWJlcn0gQ29vcmRpbmF0ZXMgYWZ0ZXIgdHJhbnNsYXRpb25cbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFRyYW5zbGF0ZVBvaW50UG9zKHRyYW5zbGF0ZSwgcG9pbnQpIHtcbiAgaWYgKCF0cmFuc2xhdGUgfHwgIXBvaW50KSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDVbMF0sXG4gICAgICB5ID0gX3BvaW50NVsxXTtcblxuICB2YXIgX3RyYW5zbGF0ZSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh0cmFuc2xhdGUsIDIpLFxuICAgICAgdHggPSBfdHJhbnNsYXRlWzBdLFxuICAgICAgdHkgPSBfdHJhbnNsYXRlWzFdO1xuXG4gIHJldHVybiBbeCArIHR4LCB5ICsgdHldO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBwb2ludCB0byB0aGUgbGluZVxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgIFBvc3Rpb24gb2YgcG9pbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGxpbmVCZWdpbiBMaW5lIHN0YXJ0IHBvc2l0aW9uXG4gKiBAcGFyYW0ge0FycmF5fSBsaW5lRW5kICAgTGluZSBlbmQgcG9zaXRpb25cbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiBwb2ludCBhbmQgbGluZVxuICovXG5cblxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lKHBvaW50LCBsaW5lQmVnaW4sIGxpbmVFbmQpIHtcbiAgaWYgKCFwb2ludCB8fCAhbGluZUJlZ2luIHx8ICFsaW5lRW5kKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDZbMF0sXG4gICAgICB5ID0gX3BvaW50NlsxXTtcblxuICB2YXIgX2xpbmVCZWdpbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lQmVnaW4sIDIpLFxuICAgICAgeDEgPSBfbGluZUJlZ2luWzBdLFxuICAgICAgeTEgPSBfbGluZUJlZ2luWzFdO1xuXG4gIHZhciBfbGluZUVuZCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lRW5kLCAyKSxcbiAgICAgIHgyID0gX2xpbmVFbmRbMF0sXG4gICAgICB5MiA9IF9saW5lRW5kWzFdO1xuXG4gIHZhciBhID0geTIgLSB5MTtcbiAgdmFyIGIgPSB4MSAtIHgyO1xuICB2YXIgYyA9IHkxICogKHgyIC0geDEpIC0geDEgKiAoeTIgLSB5MSk7XG4gIHZhciBtb2xlY3VsZSA9IGFicyhhICogeCArIGIgKiB5ICsgYyk7XG4gIHZhciBkZW5vbWluYXRvciA9IHNxcnQoYSAqIGEgKyBiICogYik7XG4gIHJldHVybiBtb2xlY3VsZSAvIGRlbm9taW5hdG9yO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc3BlY2lmaWVkIHJhZGlhbiBvbiB0aGUgY2lyY2xlXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgIENpcmNsZSB4IGNvb3JkaW5hdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICAgQ2lyY2xlIHkgY29vcmRpbmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGl1cyBDaXJjbGUgcmFkaXVzXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkaWFuIFNwZWNmaWVkIHJhZGlhblxuICogQHJldHVybiB7QXJyYXl9IFBvc3Rpb24gb2YgcG9pbnRcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldENpcmNsZVJhZGlhblBvaW50KHgsIHksIHJhZGl1cywgcmFkaWFuKSB7XG4gIHJldHVybiBbeCArIGNvcyhyYWRpYW4pICogcmFkaXVzLCB5ICsgc2luKHJhZGlhbikgKiByYWRpdXNdO1xufVxuLyoqXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcmVndWxhciBwb2x5Z29uXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgWCBjb29yZGluYXRlIG9mIHRoZSBwb2x5Z29uIGluc2NyaWJlZCBjaXJjbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvbHlnb24gaW5zY3JpYmVkIGNpcmNsZVxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgIFJhZGl1cyBvZiB0aGUgcG9seWdvbiBpbnNjcmliZWQgY2lyY2xlXG4gKiBAcGFyYW0ge051bWJlcn0gc2lkZSAgU2lkZSBudW1iZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaW51cyBSYWRpYW4gb2Zmc2V0XG4gKiBAcmV0dXJuIHtBcnJheX0gUG9pbnRzIHRoYXQgbWFrZSB1cCBhIHJlZ3VsYXIgcG9seWdvblxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmVndWxhclBvbHlnb25Qb2ludHMocngsIHJ5LCByLCBzaWRlKSB7XG4gIHZhciBtaW51cyA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogUEkgKiAtMC41O1xuICB2YXIgcmFkaWFuR2FwID0gUEkgKiAyIC8gc2lkZTtcbiAgdmFyIHJhZGlhbnMgPSBuZXcgQXJyYXkoc2lkZSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGkgKiByYWRpYW5HYXAgKyBtaW51cztcbiAgfSk7XG4gIHJldHVybiByYWRpYW5zLm1hcChmdW5jdGlvbiAocmFkaWFuKSB7XG4gICAgcmV0dXJuIGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgcmFkaWFuKTtcbiAgfSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgZGVlcENsb25lOiBkZWVwQ2xvbmUsXG4gIGVsaW1pbmF0ZUJsdXI6IGVsaW1pbmF0ZUJsdXIsXG4gIGNoZWNrUG9pbnRJc0luQ2lyY2xlOiBjaGVja1BvaW50SXNJbkNpcmNsZSxcbiAgY2hlY2tQb2ludElzSW5Qb2x5Z29uOiBjaGVja1BvaW50SXNJblBvbHlnb24sXG4gIGNoZWNrUG9pbnRJc0luU2VjdG9yOiBjaGVja1BvaW50SXNJblNlY3RvcixcbiAgY2hlY2tQb2ludElzTmVhclBvbHlsaW5lOiBjaGVja1BvaW50SXNOZWFyUG9seWxpbmUsXG4gIGdldFR3b1BvaW50RGlzdGFuY2U6IGdldFR3b1BvaW50RGlzdGFuY2UsXG4gIGdldFJvdGF0ZVBvaW50UG9zOiBnZXRSb3RhdGVQb2ludFBvcyxcbiAgZ2V0U2NhbGVQb2ludFBvczogZ2V0U2NhbGVQb2ludFBvcyxcbiAgZ2V0VHJhbnNsYXRlUG9pbnRQb3M6IGdldFRyYW5zbGF0ZVBvaW50UG9zLFxuICBnZXRDaXJjbGVSYWRpYW5Qb2ludDogZ2V0Q2lyY2xlUmFkaWFuUG9pbnQsXG4gIGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzOiBnZXRSZWd1bGFyUG9seWdvblBvaW50cyxcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lOiBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmVcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsImZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRoSG9sZXM7IiwiZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFycjJbaV0gPSBhcnJbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRob3V0SG9sZXM7IiwiZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykge1xuICB0cnkge1xuICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlamVjdChlcnJvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGluZm8uZG9uZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihfbmV4dCwgX3Rocm93KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF90aHJvdyhlcnIpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcInRocm93XCIsIGVycik7XG4gICAgICB9XG5cbiAgICAgIF9uZXh0KHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FzeW5jVG9HZW5lcmF0b3I7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2xhc3NDYWxsQ2hlY2s7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2RlZmluZVByb3BlcnR5OyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7XG4gIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXIpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyKSA9PT0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIikgcmV0dXJuIEFycmF5LmZyb20oaXRlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheTsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7XG4gIGlmICghKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PT0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIikpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcbiAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheUxpbWl0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVJlc3Q7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlU3ByZWFkOyIsInZhciBhcnJheVdpdGhIb2xlcyA9IHJlcXVpcmUoXCIuL2FycmF5V2l0aEhvbGVzXCIpO1xuXG52YXIgaXRlcmFibGVUb0FycmF5TGltaXQgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlMaW1pdFwiKTtcblxudmFyIG5vbkl0ZXJhYmxlUmVzdCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlUmVzdFwiKTtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgbm9uSXRlcmFibGVSZXN0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NsaWNlZFRvQXJyYXk7IiwidmFyIGFycmF5V2l0aG91dEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRob3V0SG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXkgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlcIik7XG5cbnZhciBub25JdGVyYWJsZVNwcmVhZCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlU3ByZWFkXCIpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBhcnJheVdpdGhvdXRIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheShhcnIpIHx8IG5vbkl0ZXJhYmxlU3ByZWFkKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3RvQ29uc3VtYWJsZUFycmF5OyIsImZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZjIgPSBmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YyID0gZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mMihvYmopOyB9XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgX3R5cGVvZjIoU3ltYm9sLml0ZXJhdG9yKSA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmJlemllckN1cnZlVG9Qb2x5bGluZSA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHMuZ2V0QmV6aWVyQ3VydmVMZW5ndGggPSBnZXRCZXppZXJDdXJ2ZUxlbmd0aDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgcG93ID0gTWF0aC5wb3csXG4gICAgY2VpbCA9IE1hdGguY2VpbCxcbiAgICBhYnMgPSBNYXRoLmFiczsgLy8gSW5pdGlhbGl6ZSB0aGUgbnVtYmVyIG9mIHBvaW50cyBwZXIgY3VydmVcblxudmFyIGRlZmF1bHRTZWdtZW50UG9pbnRzTnVtID0gNTA7XG4vKipcclxuICogQGV4YW1wbGUgZGF0YSBzdHJ1Y3R1cmUgb2YgYmV6aWVyQ3VydmVcclxuICogYmV6aWVyQ3VydmUgPSBbXHJcbiAqICAvLyBTdGFydGluZyBwb2ludCBvZiB0aGUgY3VydmVcclxuICogIFsxMCwgMTBdLFxyXG4gKiAgLy8gQmV6aWVyQ3VydmUgc2VnbWVudCBkYXRhIChjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludClcclxuICogIFtcclxuICogICAgWzIwLCAyMF0sIFs0MCwgMjBdLCBbNTAsIDEwXVxyXG4gKiAgXSxcclxuICogIC4uLlxyXG4gKiBdXHJcbiAqL1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICAgICAgQWJzdHJhY3QgdGhlIGN1cnZlIGFzIGEgcG9seWxpbmUgY29uc2lzdGluZyBvZiBOIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgMS0yMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgQ2FsY3VsYXRpb24gcmVzdWx0cyBhbmQgcmVsYXRlZCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICAgIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgIE9wdGlvbi5jeWNsZXMgTnVtYmVyIG9mIGl0ZXJhdGlvbnNcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgT3B0aW9uLnJvdW5kcyBUaGUgbnVtYmVyIG9mIHJlY3Vyc2lvbnMgZm9yIHRoZSBsYXN0IGl0ZXJhdGlvblxyXG4gKi9cblxuZnVuY3Rpb24gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcbiAgdmFyIHNlZ21lbnRzTnVtID0gYmV6aWVyQ3VydmUubGVuZ3RoIC0gMTtcbiAgdmFyIHN0YXJ0UG9pbnQgPSBiZXppZXJDdXJ2ZVswXTtcbiAgdmFyIGVuZFBvaW50ID0gYmV6aWVyQ3VydmVbc2VnbWVudHNOdW1dWzJdO1xuICB2YXIgc2VnbWVudHMgPSBiZXppZXJDdXJ2ZS5zbGljZSgxKTtcbiAgdmFyIGdldFNlZ21lbnRUUG9pbnRGdW5zID0gc2VnbWVudHMubWFwKGZ1bmN0aW9uIChzZWcsIGkpIHtcbiAgICB2YXIgYmVnaW5Qb2ludCA9IGkgPT09IDAgPyBzdGFydFBvaW50IDogc2VnbWVudHNbaSAtIDFdWzJdO1xuICAgIHJldHVybiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bi5hcHBseSh2b2lkIDAsIFtiZWdpblBvaW50XS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZWcpKSk7XG4gIH0pOyAvLyBJbml0aWFsaXplIHRoZSBjdXJ2ZSB0byBhIHBvbHlsaW5lXG5cbiAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBuZXcgQXJyYXkoc2VnbWVudHNOdW0pLmZpbGwoZGVmYXVsdFNlZ21lbnRQb2ludHNOdW0pO1xuICB2YXIgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7IC8vIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XG5cbiAgdmFyIHJlc3VsdCA9IGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pO1xuICByZXN1bHQuc2VnbWVudFBvaW50cy5wdXNoKGVuZFBvaW50KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gIEdlbmVyYXRlIGEgbWV0aG9kIGZvciBvYnRhaW5pbmcgY29ycmVzcG9uZGluZyBwb2ludCBieSB0IGFjY29yZGluZyB0byBjdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlZ2luUG9pbnQgICAgQmV6aWVyQ3VydmUgYmVnaW4gcG9pbnQuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQxIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDEuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQyIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDIuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRQb2ludCAgICAgIEJlemllckN1cnZlIGVuZCBwb2ludC4gW3gsIHldXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBFeHBlY3RlZCBmdW5jdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bihiZWdpblBvaW50LCBjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICB2YXIgdFN1YmVkMSA9IDEgLSB0O1xuICAgIHZhciB0U3ViZWQxUG93MyA9IHBvdyh0U3ViZWQxLCAzKTtcbiAgICB2YXIgdFN1YmVkMVBvdzIgPSBwb3codFN1YmVkMSwgMik7XG4gICAgdmFyIHRQb3czID0gcG93KHQsIDMpO1xuICAgIHZhciB0UG93MiA9IHBvdyh0LCAyKTtcbiAgICByZXR1cm4gW2JlZ2luUG9pbnRbMF0gKiB0U3ViZWQxUG93MyArIDMgKiBjb250cm9sUG9pbnQxWzBdICogdCAqIHRTdWJlZDFQb3cyICsgMyAqIGNvbnRyb2xQb2ludDJbMF0gKiB0UG93MiAqIHRTdWJlZDEgKyBlbmRQb2ludFswXSAqIHRQb3czLCBiZWdpblBvaW50WzFdICogdFN1YmVkMVBvdzMgKyAzICogY29udHJvbFBvaW50MVsxXSAqIHQgKiB0U3ViZWQxUG93MiArIDMgKiBjb250cm9sUG9pbnQyWzFdICogdFBvdzIgKiB0U3ViZWQxICsgZW5kUG9pbnRbMV0gKiB0UG93M107XG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBCZXppZXJDdXJ2ZSBiZWdpbiBwb2ludC4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MiBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQxLiBbeCwgeV1cclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBkaXN0YW5jZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYsIF9yZWYyKSB7XG4gIHZhciBfcmVmMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgIGF4ID0gX3JlZjNbMF0sXG4gICAgICBheSA9IF9yZWYzWzFdO1xuXG4gIHZhciBfcmVmNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMiwgMiksXG4gICAgICBieCA9IF9yZWY0WzBdLFxuICAgICAgYnkgPSBfcmVmNFsxXTtcblxuICByZXR1cm4gc3FydChwb3coYXggLSBieCwgMikgKyBwb3coYXkgLSBieSwgMikpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN1bSBvZiB0aGUgYXJyYXkgb2YgbnVtYmVyc1xyXG4gKiBAcGFyYW0ge0FycmF5fSBudW1zIEFuIGFycmF5IG9mIG51bWJlcnNcclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBzdW1cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0TnVtc1N1bShudW1zKSB7XG4gIHJldHVybiBudW1zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBudW0pIHtcbiAgICByZXR1cm4gc3VtICsgbnVtO1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzIE11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzKSB7XG4gIHJldHVybiBzZWdtZW50UG9pbnRzLm1hcChmdW5jdGlvbiAocG9pbnRzLCBpKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheShwb2ludHMubGVuZ3RoIC0gMSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKHRlbXAsIGopIHtcbiAgICAgIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50c1tqXSwgcG9pbnRzW2ogKyAxXSk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgTXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSBEaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U2VnbWVudFBvaW50c0J5TnVtKGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50UG9pbnRzTnVtKSB7XG4gIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVucy5tYXAoZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICB2YXIgdEdhcCA9IDEgLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgIHJldHVybiBuZXcgQXJyYXkoc2VnbWVudFBvaW50c051bVtpXSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVuKGogKiB0R2FwKTtcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgc3VtIG9mIGRldmlhdGlvbnMgYmV0d2VlbiBsaW5lIHNlZ21lbnQgYW5kIHRoZSBhdmVyYWdlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzRGlzdGFuY2UgU2VnbWVudCBsZW5ndGggb2YgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGF2Z0xlbmd0aCAgICAgICAgICAgIEF2ZXJhZ2UgbGVuZ3RoIG9mIHRoZSBsaW5lIHNlZ21lbnRcclxuICogQHJldHVybiB7TnVtYmVyfSBEZXZpYXRpb25zXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEFsbERldmlhdGlvbnMoc2VnbWVudFBvaW50c0Rpc3RhbmNlLCBhdmdMZW5ndGgpIHtcbiAgcmV0dXJuIHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBzZWcubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gYWJzKHMgLSBhdmdMZW5ndGgpO1xuICAgIH0pO1xuICB9KS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gIH0pLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHYpIHtcbiAgICByZXR1cm4gdG90YWwgKyB2O1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2FsY3VsYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCBwb2ludHMgYnkgaXRlcmF0aXZlbHlcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyAgICAgICAgTXVsdGlwbGUgc2V0ZCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gZ2V0U2VnbWVudFRQb2ludEZ1bnMgRnVuY3Rpb25zIG9mIGdldCBhIHBvaW50IG9uIHRoZSBjdXJ2ZSB3aXRoIHRcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudHMgICAgICAgICAgICAgQmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICAgICAgICAgICBDYWxjdWxhdGlvbiBhY2N1cmFjeVxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IENhbGN1bGF0aW9uIHJlc3VsdHMgYW5kIHJlbGF0ZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gT3B0aW9uLmN5Y2xlcyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE9wdGlvbi5yb3VuZHMgVGhlIG51bWJlciBvZiByZWN1cnNpb25zIGZvciB0aGUgbGFzdCBpdGVyYXRpb25cclxuICovXG5cblxuZnVuY3Rpb24gY2FsY1VuaWZvcm1Qb2ludHNCeUl0ZXJhdGlvbihzZWdtZW50UG9pbnRzLCBnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudHMsIHByZWNpc2lvbikge1xuICAvLyBUaGUgbnVtYmVyIG9mIGxvb3BzIGZvciB0aGUgY3VycmVudCBpdGVyYXRpb25cbiAgdmFyIHJvdW5kcyA9IDQ7IC8vIE51bWJlciBvZiBpdGVyYXRpb25zXG5cbiAgdmFyIGN5Y2xlcyA9IDE7XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoKSB7XG4gICAgLy8gUmVjYWxjdWxhdGUgdGhlIG51bWJlciBvZiBwb2ludHMgcGVyIGN1cnZlIGJhc2VkIG9uIHRoZSBsYXN0IGl0ZXJhdGlvbiBkYXRhXG4gICAgdmFyIHRvdGFsUG9pbnRzTnVtID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7IC8vIEFkZCBsYXN0IHBvaW50cyBvZiBzZWdtZW50IHRvIGNhbGMgZXhhY3Qgc2VnbWVudCBsZW5ndGhcblxuICAgIHNlZ21lbnRQb2ludHMuZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHZhciBzZWdtZW50UG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50cyk7XG4gICAgdmFyIGxpbmVTZWdtZW50TnVtID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB2YXIgdG90YWxMZW5ndGggPSBnZXROdW1zU3VtKHNlZ21lbnRsZW5ndGgpO1xuICAgIHZhciBhdmdMZW5ndGggPSB0b3RhbExlbmd0aCAvIGxpbmVTZWdtZW50TnVtOyAvLyBDaGVjayBpZiBwcmVjaXNpb24gaXMgcmVhY2hlZFxuXG4gICAgdmFyIGFsbERldmlhdGlvbnMgPSBnZXRBbGxEZXZpYXRpb25zKHNlZ21lbnRQb2ludHNEaXN0YW5jZSwgYXZnTGVuZ3RoKTtcbiAgICBpZiAoYWxsRGV2aWF0aW9ucyA8PSBwcmVjaXNpb24pIHJldHVybiBcImJyZWFrXCI7XG4gICAgdG90YWxQb2ludHNOdW0gPSBjZWlsKGF2Z0xlbmd0aCAvIHByZWNpc2lvbiAqIHRvdGFsUG9pbnRzTnVtICogMS4xKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRsZW5ndGgubWFwKGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgICAgIHJldHVybiBjZWlsKGxlbmd0aCAvIHRvdGFsTGVuZ3RoICogdG90YWxQb2ludHNOdW0pO1xuICAgIH0pOyAvLyBDYWxjdWxhdGUgdGhlIHBvaW50cyBhZnRlciByZWRpc3RyaWJ1dGlvblxuXG4gICAgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7XG4gICAgdG90YWxQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c0Zvckxlbmd0aCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VnbWVudFBvaW50cykpO1xuICAgIHNlZ21lbnRQb2ludHNGb3JMZW5ndGguZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHNlZ21lbnRQb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzRm9yTGVuZ3RoKTtcbiAgICBsaW5lU2VnbWVudE51bSA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB0b3RhbExlbmd0aCA9IGdldE51bXNTdW0oc2VnbWVudGxlbmd0aCk7XG4gICAgYXZnTGVuZ3RoID0gdG90YWxMZW5ndGggLyBsaW5lU2VnbWVudE51bTtcbiAgICB2YXIgc3RlcFNpemUgPSAxIC8gdG90YWxQb2ludHNOdW0gLyAxMDsgLy8gUmVjdXJzaXZlbHkgZm9yIGVhY2ggc2VnbWVudCBvZiB0aGUgcG9seWxpbmVcblxuICAgIGdldFNlZ21lbnRUUG9pbnRGdW5zLmZvckVhY2goZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICAgIHZhciBjdXJyZW50U2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRQb2ludHNOdW1baV07XG4gICAgICB2YXIgdCA9IG5ldyBBcnJheShjdXJyZW50U2VnbWVudFBvaW50c051bSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgICAgcmV0dXJuIGogLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgICAgfSk7IC8vIFJlcGVhdGVkIHJlY3Vyc2l2ZSBvZmZzZXRcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3VuZHM7IHIrKykge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2UoW3NlZ21lbnRQb2ludHNbaV1dKVswXTtcbiAgICAgICAgdmFyIGRldmlhdGlvbnMgPSBkaXN0YW5jZS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICByZXR1cm4gZCAtIGF2Z0xlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY3VycmVudFNlZ21lbnRQb2ludHNOdW07IGorKykge1xuICAgICAgICAgIGlmIChqID09PSAwKSByZXR1cm47XG4gICAgICAgICAgb2Zmc2V0ICs9IGRldmlhdGlvbnNbaiAtIDFdO1xuICAgICAgICAgIHRbal0gLT0gc3RlcFNpemUgKiBvZmZzZXQ7XG4gICAgICAgICAgaWYgKHRbal0gPiAxKSB0W2pdID0gMTtcbiAgICAgICAgICBpZiAodFtqXSA8IDApIHRbal0gPSAwO1xuICAgICAgICAgIHNlZ21lbnRQb2ludHNbaV1bal0gPSBnZXRTZWdtZW50VFBvaW50RnVuKHRbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcm91bmRzICo9IDQ7XG4gICAgY3ljbGVzKys7XG4gIH07XG5cbiAgZG8ge1xuICAgIHZhciBfcmV0ID0gX2xvb3AoKTtcblxuICAgIGlmIChfcmV0ID09PSBcImJyZWFrXCIpIGJyZWFrO1xuICB9IHdoaWxlIChyb3VuZHMgPD0gMTAyNSk7XG5cbiAgc2VnbWVudFBvaW50cyA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uIChhbGwsIHNlZykge1xuICAgIHJldHVybiBhbGwuY29uY2F0KHNlZyk7XG4gIH0sIFtdKTtcbiAgcmV0dXJuIHtcbiAgICBzZWdtZW50UG9pbnRzOiBzZWdtZW50UG9pbnRzLFxuICAgIGN5Y2xlczogY3ljbGVzLFxuICAgIHJvdW5kczogcm91bmRzXG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcG9seWxpbmUgY29ycmVzcG9uZGluZyB0byB0aGUgQmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIEJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgQ2FsY3VsYXRpb24gYWNjdXJhY3kuIFJlY29tbWVuZGVkIGZvciAxLTIwLiBEZWZhdWx0ID0gNVxyXG4gKiBAcmV0dXJuIHtBcnJheXxCb29sZWFufSBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvbiAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gYmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG5cbiAgaWYgKCFiZXppZXJDdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghKGJlemllckN1cnZlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IFBhcmFtZXRlciBwcmVjaXNpb24gbXVzdCBiZSBhIG51bWJlciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgX2Fic3RyYWN0QmV6aWVyQ3VydmVUID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVULnNlZ21lbnRQb2ludHM7XG5cbiAgcmV0dXJuIHNlZ21lbnRQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgYmV6aWVyIGN1cnZlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgNS0xMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7TnVtYmVyfEJvb2xlYW59IEJlemllckN1cnZlIGxlbmd0aCAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVMZW5ndGgoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcblxuICBpZiAoIWJlemllckN1cnZlKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShiZXppZXJDdXJ2ZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogUGFyYW1ldGVyIHByZWNpc2lvbiBtdXN0IGJlIGEgbnVtYmVyIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQyID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVUMi5zZWdtZW50UG9pbnRzOyAvLyBDYWxjdWxhdGUgdGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgcG9pbnRzIHRoYXQgbWFrZSB1cCB0aGUgcG9seWxpbmVcblxuXG4gIHZhciBwb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShbc2VnbWVudFBvaW50c10pWzBdO1xuICB2YXIgbGVuZ3RoID0gZ2V0TnVtc1N1bShwb2ludHNEaXN0YW5jZSk7XG4gIHJldHVybiBsZW5ndGg7XG59XG5cbnZhciBfZGVmYXVsdCA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFic3RyYWN0IHRoZSBwb2x5bGluZSBmb3JtZWQgYnkgTiBwb2ludHMgaW50byBhIHNldCBvZiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgQSBzZXQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gQSBzZXQgb2YgYmV6aWVyIGN1cnZlIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cbmZ1bmN0aW9uIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2x5bGluZSkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDAuMjU7XG5cbiAgaWYgKCEocG9seWxpbmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwb2x5bGluZVRvQmV6aWVyQ3VydmU6IFBhcmFtZXRlciBwb2x5bGluZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChwb2x5bGluZS5sZW5ndGggPD0gMikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BvbHlsaW5lVG9CZXppZXJDdXJ2ZTogQ29udmVydGluZyB0byBhIGN1cnZlIHJlcXVpcmVzIGF0IGxlYXN0IDMgcG9pbnRzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGFydFBvaW50ID0gcG9seWxpbmVbMF07XG4gIHZhciBiZXppZXJDdXJ2ZUxpbmVOdW0gPSBwb2x5bGluZS5sZW5ndGggLSAxO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludHMgPSBuZXcgQXJyYXkoYmV6aWVyQ3VydmVMaW5lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdldEJlemllckN1cnZlTGluZUNvbnRyb2xQb2ludHMocG9seWxpbmUsIGksIGNsb3NlLCBvZmZzZXRBLCBvZmZzZXRCKSksIFtwb2x5bGluZVtpICsgMV1dKTtcbiAgfSk7XG4gIGlmIChjbG9zZSkgY2xvc2VCZXppZXJDdXJ2ZShiZXppZXJDdXJ2ZVBvaW50cywgc3RhcnRQb2ludCk7XG4gIGJlemllckN1cnZlUG9pbnRzLnVuc2hpZnQocG9seWxpbmVbMF0pO1xuICByZXR1cm4gYmV6aWVyQ3VydmVQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29udHJvbCBwb2ludHMgb2YgdGhlIEJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSBBIHNldCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4ICAgVGhlIGluZGV4IG9mIHdoaWNoIGdldCBjb250cm9scyBwb2ludHMncyBwb2ludCBpbiBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlICBDbG9zZWQgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEEgU21vb3RobmVzc1xyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QiBTbW9vdGhuZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBDb250cm9sIHBvaW50c1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZUxpbmVDb250cm9sUG9pbnRzKHBvbHlsaW5lLCBpbmRleCkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDAuMjU7XG4gIHZhciBwb2ludE51bSA9IHBvbHlsaW5lLmxlbmd0aDtcbiAgaWYgKHBvaW50TnVtIDwgMyB8fCBpbmRleCA+PSBwb2ludE51bSkgcmV0dXJuO1xuICB2YXIgYmVmb3JlUG9pbnRJbmRleCA9IGluZGV4IC0gMTtcbiAgaWYgKGJlZm9yZVBvaW50SW5kZXggPCAwKSBiZWZvcmVQb2ludEluZGV4ID0gY2xvc2UgPyBwb2ludE51bSArIGJlZm9yZVBvaW50SW5kZXggOiAwO1xuICB2YXIgYWZ0ZXJQb2ludEluZGV4ID0gaW5kZXggKyAxO1xuICBpZiAoYWZ0ZXJQb2ludEluZGV4ID49IHBvaW50TnVtKSBhZnRlclBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyUG9pbnRJbmRleCAtIHBvaW50TnVtIDogcG9pbnROdW0gLSAxO1xuICB2YXIgYWZ0ZXJOZXh0UG9pbnRJbmRleCA9IGluZGV4ICsgMjtcbiAgaWYgKGFmdGVyTmV4dFBvaW50SW5kZXggPj0gcG9pbnROdW0pIGFmdGVyTmV4dFBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyTmV4dFBvaW50SW5kZXggLSBwb2ludE51bSA6IHBvaW50TnVtIC0gMTtcbiAgdmFyIHBvaW50QmVmb3JlID0gcG9seWxpbmVbYmVmb3JlUG9pbnRJbmRleF07XG4gIHZhciBwb2ludE1pZGRsZSA9IHBvbHlsaW5lW2luZGV4XTtcbiAgdmFyIHBvaW50QWZ0ZXIgPSBwb2x5bGluZVthZnRlclBvaW50SW5kZXhdO1xuICB2YXIgcG9pbnRBZnRlck5leHQgPSBwb2x5bGluZVthZnRlck5leHRQb2ludEluZGV4XTtcbiAgcmV0dXJuIFtbcG9pbnRNaWRkbGVbMF0gKyBvZmZzZXRBICogKHBvaW50QWZ0ZXJbMF0gLSBwb2ludEJlZm9yZVswXSksIHBvaW50TWlkZGxlWzFdICsgb2Zmc2V0QSAqIChwb2ludEFmdGVyWzFdIC0gcG9pbnRCZWZvcmVbMV0pXSwgW3BvaW50QWZ0ZXJbMF0gLSBvZmZzZXRCICogKHBvaW50QWZ0ZXJOZXh0WzBdIC0gcG9pbnRNaWRkbGVbMF0pLCBwb2ludEFmdGVyWzFdIC0gb2Zmc2V0QiAqIChwb2ludEFmdGVyTmV4dFsxXSAtIHBvaW50TWlkZGxlWzFdKV1dO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGxhc3QgY3VydmUgb2YgdGhlIGNsb3N1cmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgQSBzZXQgb2Ygc3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0UG9pbnQgIFN0YXJ0IHBvaW50XHJcbiAqIEByZXR1cm4ge0FycmF5fSBUaGUgbGFzdCBjdXJ2ZSBmb3IgY2xvc3VyZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBjbG9zZUJlemllckN1cnZlKGJlemllckN1cnZlLCBzdGFydFBvaW50KSB7XG4gIHZhciBmaXJzdFN1YkN1cnZlID0gYmV6aWVyQ3VydmVbMF07XG4gIHZhciBsYXN0U3ViQ3VydmUgPSBiZXppZXJDdXJ2ZS5zbGljZSgtMSlbMF07XG4gIGJlemllckN1cnZlLnB1c2goW2dldFN5bW1ldHJ5UG9pbnQobGFzdFN1YkN1cnZlWzFdLCBsYXN0U3ViQ3VydmVbMl0pLCBnZXRTeW1tZXRyeVBvaW50KGZpcnN0U3ViQ3VydmVbMF0sIHN0YXJ0UG9pbnQpLCBzdGFydFBvaW50XSk7XG4gIHJldHVybiBiZXppZXJDdXJ2ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzeW1tZXRyeSBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgICBTeW1tZXRyaWMgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gY2VudGVyUG9pbnQgU3ltbWV0cmljIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtBcnJheX0gU3ltbWV0cmljIHBvaW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFN5bW1ldHJ5UG9pbnQocG9pbnQsIGNlbnRlclBvaW50KSB7XG4gIHZhciBfcG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgcHggPSBfcG9pbnRbMF0sXG4gICAgICBweSA9IF9wb2ludFsxXTtcblxuICB2YXIgX2NlbnRlclBvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvaW50LCAyKSxcbiAgICAgIGN4ID0gX2NlbnRlclBvaW50WzBdLFxuICAgICAgY3kgPSBfY2VudGVyUG9pbnRbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGN4IC0gcHg7XG4gIHZhciBtaW51c1kgPSBjeSAtIHB5O1xuICByZXR1cm4gW2N4ICsgbWludXNYLCBjeSArIG1pbnVzWV07XG59XG5cbnZhciBfZGVmYXVsdCA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEJlemllckN1cnZlTGVuZ3RoXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicG9seWxpbmVUb0JlemllckN1cnZlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2JlemllckN1cnZlVG9Qb2x5bGluZSA9IHJlcXVpcmUoXCIuL2NvcmUvYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIpO1xuXG52YXIgX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmVcIikpO1xuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGJlemllckN1cnZlVG9Qb2x5bGluZTogX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmUsXG4gIGdldEJlemllckN1cnZlTGVuZ3RoOiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmdldEJlemllckN1cnZlTGVuZ3RoLFxuICBwb2x5bGluZVRvQmV6aWVyQ3VydmU6IF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2RlZmF1bHQgPSBuZXcgTWFwKFtbJ3RyYW5zcGFyZW50JywgJ3JnYmEoMCwwLDAsMCknXSwgWydibGFjaycsICcjMDAwMDAwJ10sIFsnc2lsdmVyJywgJyNDMEMwQzAnXSwgWydncmF5JywgJyM4MDgwODAnXSwgWyd3aGl0ZScsICcjRkZGRkZGJ10sIFsnbWFyb29uJywgJyM4MDAwMDAnXSwgWydyZWQnLCAnI0ZGMDAwMCddLCBbJ3B1cnBsZScsICcjODAwMDgwJ10sIFsnZnVjaHNpYScsICcjRkYwMEZGJ10sIFsnZ3JlZW4nLCAnIzAwODAwMCddLCBbJ2xpbWUnLCAnIzAwRkYwMCddLCBbJ29saXZlJywgJyM4MDgwMDAnXSwgWyd5ZWxsb3cnLCAnI0ZGRkYwMCddLCBbJ25hdnknLCAnIzAwMDA4MCddLCBbJ2JsdWUnLCAnIzAwMDBGRiddLCBbJ3RlYWwnLCAnIzAwODA4MCddLCBbJ2FxdWEnLCAnIzAwRkZGRiddLCBbJ2FsaWNlYmx1ZScsICcjZjBmOGZmJ10sIFsnYW50aXF1ZXdoaXRlJywgJyNmYWViZDcnXSwgWydhcXVhbWFyaW5lJywgJyM3ZmZmZDQnXSwgWydhenVyZScsICcjZjBmZmZmJ10sIFsnYmVpZ2UnLCAnI2Y1ZjVkYyddLCBbJ2Jpc3F1ZScsICcjZmZlNGM0J10sIFsnYmxhbmNoZWRhbG1vbmQnLCAnI2ZmZWJjZCddLCBbJ2JsdWV2aW9sZXQnLCAnIzhhMmJlMiddLCBbJ2Jyb3duJywgJyNhNTJhMmEnXSwgWydidXJseXdvb2QnLCAnI2RlYjg4NyddLCBbJ2NhZGV0Ymx1ZScsICcjNWY5ZWEwJ10sIFsnY2hhcnRyZXVzZScsICcjN2ZmZjAwJ10sIFsnY2hvY29sYXRlJywgJyNkMjY5MWUnXSwgWydjb3JhbCcsICcjZmY3ZjUwJ10sIFsnY29ybmZsb3dlcmJsdWUnLCAnIzY0OTVlZCddLCBbJ2Nvcm5zaWxrJywgJyNmZmY4ZGMnXSwgWydjcmltc29uJywgJyNkYzE0M2MnXSwgWydjeWFuJywgJyMwMGZmZmYnXSwgWydkYXJrYmx1ZScsICcjMDAwMDhiJ10sIFsnZGFya2N5YW4nLCAnIzAwOGI4YiddLCBbJ2Rhcmtnb2xkZW5yb2QnLCAnI2I4ODYwYiddLCBbJ2RhcmtncmF5JywgJyNhOWE5YTknXSwgWydkYXJrZ3JlZW4nLCAnIzAwNjQwMCddLCBbJ2RhcmtncmV5JywgJyNhOWE5YTknXSwgWydkYXJra2hha2knLCAnI2JkYjc2YiddLCBbJ2RhcmttYWdlbnRhJywgJyM4YjAwOGInXSwgWydkYXJrb2xpdmVncmVlbicsICcjNTU2YjJmJ10sIFsnZGFya29yYW5nZScsICcjZmY4YzAwJ10sIFsnZGFya29yY2hpZCcsICcjOTkzMmNjJ10sIFsnZGFya3JlZCcsICcjOGIwMDAwJ10sIFsnZGFya3NhbG1vbicsICcjZTk5NjdhJ10sIFsnZGFya3NlYWdyZWVuJywgJyM4ZmJjOGYnXSwgWydkYXJrc2xhdGVibHVlJywgJyM0ODNkOGInXSwgWydkYXJrc2xhdGVncmF5JywgJyMyZjRmNGYnXSwgWydkYXJrc2xhdGVncmV5JywgJyMyZjRmNGYnXSwgWydkYXJrdHVycXVvaXNlJywgJyMwMGNlZDEnXSwgWydkYXJrdmlvbGV0JywgJyM5NDAwZDMnXSwgWydkZWVwcGluaycsICcjZmYxNDkzJ10sIFsnZGVlcHNreWJsdWUnLCAnIzAwYmZmZiddLCBbJ2RpbWdyYXknLCAnIzY5Njk2OSddLCBbJ2RpbWdyZXknLCAnIzY5Njk2OSddLCBbJ2RvZGdlcmJsdWUnLCAnIzFlOTBmZiddLCBbJ2ZpcmVicmljaycsICcjYjIyMjIyJ10sIFsnZmxvcmFsd2hpdGUnLCAnI2ZmZmFmMCddLCBbJ2ZvcmVzdGdyZWVuJywgJyMyMjhiMjInXSwgWydnYWluc2Jvcm8nLCAnI2RjZGNkYyddLCBbJ2dob3N0d2hpdGUnLCAnI2Y4ZjhmZiddLCBbJ2dvbGQnLCAnI2ZmZDcwMCddLCBbJ2dvbGRlbnJvZCcsICcjZGFhNTIwJ10sIFsnZ3JlZW55ZWxsb3cnLCAnI2FkZmYyZiddLCBbJ2dyZXknLCAnIzgwODA4MCddLCBbJ2hvbmV5ZGV3JywgJyNmMGZmZjAnXSwgWydob3RwaW5rJywgJyNmZjY5YjQnXSwgWydpbmRpYW5yZWQnLCAnI2NkNWM1YyddLCBbJ2luZGlnbycsICcjNGIwMDgyJ10sIFsnaXZvcnknLCAnI2ZmZmZmMCddLCBbJ2toYWtpJywgJyNmMGU2OGMnXSwgWydsYXZlbmRlcicsICcjZTZlNmZhJ10sIFsnbGF2ZW5kZXJibHVzaCcsICcjZmZmMGY1J10sIFsnbGF3bmdyZWVuJywgJyM3Y2ZjMDAnXSwgWydsZW1vbmNoaWZmb24nLCAnI2ZmZmFjZCddLCBbJ2xpZ2h0Ymx1ZScsICcjYWRkOGU2J10sIFsnbGlnaHRjb3JhbCcsICcjZjA4MDgwJ10sIFsnbGlnaHRjeWFuJywgJyNlMGZmZmYnXSwgWydsaWdodGdvbGRlbnJvZHllbGxvdycsICcjZmFmYWQyJ10sIFsnbGlnaHRncmF5JywgJyNkM2QzZDMnXSwgWydsaWdodGdyZWVuJywgJyM5MGVlOTAnXSwgWydsaWdodGdyZXknLCAnI2QzZDNkMyddLCBbJ2xpZ2h0cGluaycsICcjZmZiNmMxJ10sIFsnbGlnaHRzYWxtb24nLCAnI2ZmYTA3YSddLCBbJ2xpZ2h0c2VhZ3JlZW4nLCAnIzIwYjJhYSddLCBbJ2xpZ2h0c2t5Ymx1ZScsICcjODdjZWZhJ10sIFsnbGlnaHRzbGF0ZWdyYXknLCAnIzc3ODg5OSddLCBbJ2xpZ2h0c2xhdGVncmV5JywgJyM3Nzg4OTknXSwgWydsaWdodHN0ZWVsYmx1ZScsICcjYjBjNGRlJ10sIFsnbGlnaHR5ZWxsb3cnLCAnI2ZmZmZlMCddLCBbJ2xpbWVncmVlbicsICcjMzJjZDMyJ10sIFsnbGluZW4nLCAnI2ZhZjBlNiddLCBbJ21hZ2VudGEnLCAnI2ZmMDBmZiddLCBbJ21lZGl1bWFxdWFtYXJpbmUnLCAnIzY2Y2RhYSddLCBbJ21lZGl1bWJsdWUnLCAnIzAwMDBjZCddLCBbJ21lZGl1bW9yY2hpZCcsICcjYmE1NWQzJ10sIFsnbWVkaXVtcHVycGxlJywgJyM5MzcwZGInXSwgWydtZWRpdW1zZWFncmVlbicsICcjM2NiMzcxJ10sIFsnbWVkaXVtc2xhdGVibHVlJywgJyM3YjY4ZWUnXSwgWydtZWRpdW1zcHJpbmdncmVlbicsICcjMDBmYTlhJ10sIFsnbWVkaXVtdHVycXVvaXNlJywgJyM0OGQxY2MnXSwgWydtZWRpdW12aW9sZXRyZWQnLCAnI2M3MTU4NSddLCBbJ21pZG5pZ2h0Ymx1ZScsICcjMTkxOTcwJ10sIFsnbWludGNyZWFtJywgJyNmNWZmZmEnXSwgWydtaXN0eXJvc2UnLCAnI2ZmZTRlMSddLCBbJ21vY2Nhc2luJywgJyNmZmU0YjUnXSwgWyduYXZham93aGl0ZScsICcjZmZkZWFkJ10sIFsnb2xkbGFjZScsICcjZmRmNWU2J10sIFsnb2xpdmVkcmFiJywgJyM2YjhlMjMnXSwgWydvcmFuZ2UnLCAnI2ZmYTUwMCddLCBbJ29yYW5nZXJlZCcsICcjZmY0NTAwJ10sIFsnb3JjaGlkJywgJyNkYTcwZDYnXSwgWydwYWxlZ29sZGVucm9kJywgJyNlZWU4YWEnXSwgWydwYWxlZ3JlZW4nLCAnIzk4ZmI5OCddLCBbJ3BhbGV0dXJxdW9pc2UnLCAnI2FmZWVlZSddLCBbJ3BhbGV2aW9sZXRyZWQnLCAnI2RiNzA5MyddLCBbJ3BhcGF5YXdoaXAnLCAnI2ZmZWZkNSddLCBbJ3BlYWNocHVmZicsICcjZmZkYWI5J10sIFsncGVydScsICcjY2Q4NTNmJ10sIFsncGluaycsICcjZmZjMGNiJ10sIFsncGx1bScsICcjZGRhMGRkJ10sIFsncG93ZGVyYmx1ZScsICcjYjBlMGU2J10sIFsncm9zeWJyb3duJywgJyNiYzhmOGYnXSwgWydyb3lhbGJsdWUnLCAnIzQxNjllMSddLCBbJ3NhZGRsZWJyb3duJywgJyM4YjQ1MTMnXSwgWydzYWxtb24nLCAnI2ZhODA3MiddLCBbJ3NhbmR5YnJvd24nLCAnI2Y0YTQ2MCddLCBbJ3NlYWdyZWVuJywgJyMyZThiNTcnXSwgWydzZWFzaGVsbCcsICcjZmZmNWVlJ10sIFsnc2llbm5hJywgJyNhMDUyMmQnXSwgWydza3libHVlJywgJyM4N2NlZWInXSwgWydzbGF0ZWJsdWUnLCAnIzZhNWFjZCddLCBbJ3NsYXRlZ3JheScsICcjNzA4MDkwJ10sIFsnc2xhdGVncmV5JywgJyM3MDgwOTAnXSwgWydzbm93JywgJyNmZmZhZmEnXSwgWydzcHJpbmdncmVlbicsICcjMDBmZjdmJ10sIFsnc3RlZWxibHVlJywgJyM0NjgyYjQnXSwgWyd0YW4nLCAnI2QyYjQ4YyddLCBbJ3RoaXN0bGUnLCAnI2Q4YmZkOCddLCBbJ3RvbWF0bycsICcjZmY2MzQ3J10sIFsndHVycXVvaXNlJywgJyM0MGUwZDAnXSwgWyd2aW9sZXQnLCAnI2VlODJlZSddLCBbJ3doZWF0JywgJyNmNWRlYjMnXSwgWyd3aGl0ZXNtb2tlJywgJyNmNWY1ZjUnXSwgWyd5ZWxsb3dncmVlbicsICcjOWFjZDMyJ11dKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldFJnYlZhbHVlID0gZ2V0UmdiVmFsdWU7XG5leHBvcnRzLmdldFJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZTtcbmV4cG9ydHMuZ2V0T3BhY2l0eSA9IGdldE9wYWNpdHk7XG5leHBvcnRzLnRvUmdiID0gdG9SZ2I7XG5leHBvcnRzLnRvSGV4ID0gdG9IZXg7XG5leHBvcnRzLmdldENvbG9yRnJvbVJnYlZhbHVlID0gZ2V0Q29sb3JGcm9tUmdiVmFsdWU7XG5leHBvcnRzLmRhcmtlbiA9IGRhcmtlbjtcbmV4cG9ydHMubGlnaHRlbiA9IGxpZ2h0ZW47XG5leHBvcnRzLmZhZGUgPSBmYWRlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfa2V5d29yZHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NvbmZpZy9rZXl3b3Jkc1wiKSk7XG5cbnZhciBoZXhSZWcgPSAvXiMoWzAtOWEtZkEtZl17M318WzAtOWEtZkEtZl17Nn0pJC87XG52YXIgcmdiUmVnID0gL14ocmdifHJnYmF8UkdCfFJHQkEpLztcbnZhciByZ2JhUmVnID0gL14ocmdiYXxSR0JBKS87XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbG9yIHZhbGlkYXRvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFZhbGlkIGNvbG9yIE9yIGZhbHNlXHJcbiAqL1xuXG5mdW5jdGlvbiB2YWxpZGF0b3IoY29sb3IpIHtcbiAgdmFyIGlzSGV4ID0gaGV4UmVnLnRlc3QoY29sb3IpO1xuICB2YXIgaXNSZ2IgPSByZ2JSZWcudGVzdChjb2xvcik7XG4gIGlmIChpc0hleCB8fCBpc1JnYikgcmV0dXJuIGNvbG9yO1xuICBjb2xvciA9IGdldENvbG9yQnlLZXl3b3JkKGNvbG9yKTtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQ29sb3I6IEludmFsaWQgY29sb3IhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGNvbG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgY29sb3IgYnkga2V5d29yZFxyXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBDb2xvciBrZXl3b3JkIGxpa2UgcmVkLCBncmVlbiBhbmQgZXRjLlxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gSGV4IG9yIHJnYmEgY29sb3IgKEludmFsaWQga2V5d29yZCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Q29sb3JCeUtleXdvcmQoa2V5d29yZCkge1xuICBpZiAoIWtleXdvcmQpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckJ5S2V5d29yZHM6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIV9rZXl3b3Jkc1tcImRlZmF1bHRcIl0uaGFzKGtleXdvcmQpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBfa2V5d29yZHNbXCJkZWZhdWx0XCJdLmdldChrZXl3b3JkKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtBcnJheTxOdW1iZXI+fEJvb2xlYW59IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYlZhbHVlKGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRSZ2JWYWx1ZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbG9yID0gdmFsaWRhdG9yKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNIZXggPSBoZXhSZWcudGVzdChjb2xvcik7XG4gIHZhciBpc1JnYiA9IHJnYlJlZy50ZXN0KGNvbG9yKTtcbiAgdmFyIGxvd2VyQ29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICBpZiAoaXNIZXgpIHJldHVybiBnZXRSZ2JWYWx1ZUZyb21IZXgobG93ZXJDb2xvcik7XG4gIGlmIChpc1JnYikgcmV0dXJuIGdldFJnYlZhbHVlRnJvbVJnYihsb3dlckNvbG9yKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSByZ2IgdmFsdWUgb2YgdGhlIGhleCBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj59IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWVGcm9tSGV4KGNvbG9yKSB7XG4gIGNvbG9yID0gY29sb3IucmVwbGFjZSgnIycsICcnKTtcbiAgaWYgKGNvbG9yLmxlbmd0aCA9PT0gMykgY29sb3IgPSBBcnJheS5mcm9tKGNvbG9yKS5tYXAoZnVuY3Rpb24gKGhleE51bSkge1xuICAgIHJldHVybiBoZXhOdW0gKyBoZXhOdW07XG4gIH0pLmpvaW4oJycpO1xuICBjb2xvciA9IGNvbG9yLnNwbGl0KCcnKTtcbiAgcmV0dXJuIG5ldyBBcnJheSgzKS5maWxsKDApLm1hcChmdW5jdGlvbiAodCwgaSkge1xuICAgIHJldHVybiBwYXJzZUludChcIjB4XCIuY29uY2F0KGNvbG9yW2kgKiAyXSkuY29uY2F0KGNvbG9yW2kgKiAyICsgMV0pKTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcmdiIHZhbHVlIG9mIHRoZSByZ2IvcmdiYSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5fSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYlZhbHVlRnJvbVJnYihjb2xvcikge1xuICByZXR1cm4gY29sb3IucmVwbGFjZSgvcmdiXFwofHJnYmFcXCh8XFwpL2csICcnKS5zcGxpdCgnLCcpLnNsaWNlKDAsIDMpLm1hcChmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBwYXJzZUludChuKTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgUmdiYSB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj58Qm9vbGVhbn0gUmdiYSB2YWx1ZSBvZiB0aGUgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYmFWYWx1ZShjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0UmdiYVZhbHVlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNvbG9yVmFsdWUgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghY29sb3JWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICBjb2xvclZhbHVlLnB1c2goZ2V0T3BhY2l0eShjb2xvcikpO1xuICByZXR1cm4gY29sb3JWYWx1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBvcGFjaXR5IG9mIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ8Qm9vbGVhbn0gQ29sb3Igb3BhY2l0eSAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0T3BhY2l0eShjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0T3BhY2l0eTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbG9yID0gdmFsaWRhdG9yKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNSZ2JhID0gcmdiYVJlZy50ZXN0KGNvbG9yKTtcbiAgaWYgKCFpc1JnYmEpIHJldHVybiAxO1xuICBjb2xvciA9IGNvbG9yLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiBOdW1iZXIoY29sb3Iuc3BsaXQoJywnKS5zbGljZSgtMSlbMF0ucmVwbGFjZSgvWyl8XFxzXS9nLCAnJykpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDb252ZXJ0IGNvbG9yIHRvIFJnYnxSZ2JhIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciAgIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcGFjaXR5IFRoZSBvcGFjaXR5IG9mIGNvbG9yXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2J8UmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gdG9SZ2IoY29sb3IsIG9wYWNpdHkpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RvUmdiOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYlZhbHVlID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYlZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHZhciBhZGRPcGFjaXR5ID0gdHlwZW9mIG9wYWNpdHkgPT09ICdudW1iZXInO1xuICBpZiAoYWRkT3BhY2l0eSkgcmV0dXJuICdyZ2JhKCcgKyByZ2JWYWx1ZS5qb2luKCcsJykgKyBcIixcIi5jb25jYXQob3BhY2l0eSwgXCIpXCIpO1xuICByZXR1cm4gJ3JnYignICsgcmdiVmFsdWUuam9pbignLCcpICsgJyknO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDb252ZXJ0IGNvbG9yIHRvIEhleCBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IEhleCBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gdG9IZXgoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RvSGV4OiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGhleFJlZy50ZXN0KGNvbG9yKSkgcmV0dXJuIGNvbG9yO1xuICBjb2xvciA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gJyMnICsgY29sb3IubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIE51bWJlcihuKS50b1N0cmluZygxNik7XG4gIH0pLm1hcChmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBuID09PSAnMCcgPyAnMDAnIDogbjtcbiAgfSkuam9pbignJyk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBDb2xvciBmcm9tIFJnYnxSZ2JhIHZhbHVlXHJcbiAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPn0gdmFsdWUgUmdifFJnYmEgY29sb3IgdmFsdWVcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYnxSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRDb2xvckZyb21SZ2JWYWx1ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cbiAgaWYgKHZhbHVlTGVuZ3RoICE9PSAzICYmIHZhbHVlTGVuZ3RoICE9PSA0KSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IFZhbHVlIGlzIGlsbGVnYWwhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNvbG9yID0gdmFsdWVMZW5ndGggPT09IDMgPyAncmdiKCcgOiAncmdiYSgnO1xuICBjb2xvciArPSB2YWx1ZS5qb2luKCcsJykgKyAnKSc7XG4gIHJldHVybiBjb2xvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRGVlcGVuIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFBlcmNlbnQgb2YgRGVlcGVuICgxLTEwMClcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRhcmtlbihjb2xvcikge1xuICB2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZGFya2VuOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiYVZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHJnYmFWYWx1ZSA9IHJnYmFWYWx1ZS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gaSA9PT0gMyA/IHYgOiB2IC0gTWF0aC5jZWlsKDIuNTUgKiBwZXJjZW50KTtcbiAgfSkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHYgPCAwID8gMCA6IHY7XG4gIH0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQnJpZ2h0ZW4gY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcn0gUGVyY2VudCBvZiBicmlnaHRlbiAoMS0xMDApXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBsaWdodGVuKGNvbG9yKSB7XG4gIHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdsaWdodGVuOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiYVZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHJnYmFWYWx1ZSA9IHJnYmFWYWx1ZS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gaSA9PT0gMyA/IHYgOiB2ICsgTWF0aC5jZWlsKDIuNTUgKiBwZXJjZW50KTtcbiAgfSkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHYgPiAyNTUgPyAyNTUgOiB2O1xuICB9KTtcbiAgcmV0dXJuIGdldENvbG9yRnJvbVJnYlZhbHVlKHJnYmFWYWx1ZSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFkanVzdCBjb2xvciBvcGFjaXR5XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciAgIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBQZXJjZW50IG9mIG9wYWNpdHlcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGZhZGUoY29sb3IpIHtcbiAgdmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDEwMDtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZmFkZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZ2JWYWx1ZSA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICB2YXIgcmdiYVZhbHVlID0gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocmdiVmFsdWUpLCBbcGVyY2VudCAvIDEwMF0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cblxudmFyIF9kZWZhdWx0ID0ge1xuICBmYWRlOiBmYWRlLFxuICB0b0hleDogdG9IZXgsXG4gIHRvUmdiOiB0b1JnYixcbiAgZGFya2VuOiBkYXJrZW4sXG4gIGxpZ2h0ZW46IGxpZ2h0ZW4sXG4gIGdldE9wYWNpdHk6IGdldE9wYWNpdHksXG4gIGdldFJnYlZhbHVlOiBnZXRSZ2JWYWx1ZSxcbiAgZ2V0UmdiYVZhbHVlOiBnZXRSZ2JhVmFsdWUsXG4gIGdldENvbG9yRnJvbVJnYlZhbHVlOiBnZXRDb2xvckZyb21SZ2JWYWx1ZVxufTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGV4cG9ydHMuZWFzZUluT3V0Qm91bmNlID0gZXhwb3J0cy5lYXNlT3V0Qm91bmNlID0gZXhwb3J0cy5lYXNlSW5Cb3VuY2UgPSBleHBvcnRzLmVhc2VJbk91dEVsYXN0aWMgPSBleHBvcnRzLmVhc2VPdXRFbGFzdGljID0gZXhwb3J0cy5lYXNlSW5FbGFzdGljID0gZXhwb3J0cy5lYXNlSW5PdXRCYWNrID0gZXhwb3J0cy5lYXNlT3V0QmFjayA9IGV4cG9ydHMuZWFzZUluQmFjayA9IGV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBleHBvcnRzLmVhc2VPdXRRdWludCA9IGV4cG9ydHMuZWFzZUluUXVpbnQgPSBleHBvcnRzLmVhc2VJbk91dFF1YXJ0ID0gZXhwb3J0cy5lYXNlT3V0UXVhcnQgPSBleHBvcnRzLmVhc2VJblF1YXJ0ID0gZXhwb3J0cy5lYXNlSW5PdXRDdWJpYyA9IGV4cG9ydHMuZWFzZU91dEN1YmljID0gZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGV4cG9ydHMuZWFzZU91dFF1YWQgPSBleHBvcnRzLmVhc2VJblF1YWQgPSBleHBvcnRzLmVhc2VJbk91dFNpbmUgPSBleHBvcnRzLmVhc2VPdXRTaW5lID0gZXhwb3J0cy5lYXNlSW5TaW5lID0gZXhwb3J0cy5saW5lYXIgPSB2b2lkIDA7XG52YXIgbGluZWFyID0gW1tbMCwgMV0sICcnLCBbMC4zMywgMC42N11dLCBbWzEsIDBdLCBbMC42NywgMC4zM11dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2luZVxyXG4gKi9cblxuZXhwb3J0cy5saW5lYXIgPSBsaW5lYXI7XG52YXIgZWFzZUluU2luZSA9IFtbWzAsIDFdXSwgW1swLjUzOCwgMC41NjRdLCBbMC4xNjksIDAuOTEyXSwgWzAuODgwLCAwLjE5Nl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblNpbmUgPSBlYXNlSW5TaW5lO1xudmFyIGVhc2VPdXRTaW5lID0gW1tbMCwgMV1dLCBbWzAuNDQ0LCAwLjQ0OF0sIFswLjE2OSwgMC43MzZdLCBbMC43MTgsIDAuMTZdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0U2luZSA9IGVhc2VPdXRTaW5lO1xudmFyIGVhc2VJbk91dFNpbmUgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4yLCAxXSwgWzAuOCwgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFF1YWRcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0U2luZSA9IGVhc2VJbk91dFNpbmU7XG52YXIgZWFzZUluUXVhZCA9IFtbWzAsIDFdXSwgW1swLjU1MCwgMC41ODRdLCBbMC4yMzEsIDAuOTA0XSwgWzAuODY4LCAwLjI2NF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1YWQgPSBlYXNlSW5RdWFkO1xudmFyIGVhc2VPdXRRdWFkID0gW1tbMCwgMV1dLCBbWzAuNDEzLCAwLjQyOF0sIFswLjA2NSwgMC44MTZdLCBbMC43NjAsIDAuMDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0UXVhZCA9IGVhc2VPdXRRdWFkO1xudmFyIGVhc2VJbk91dFF1YWQgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4zLCAwLjldLCBbMC43LCAwLjFdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDdWJpY1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZWFzZUluT3V0UXVhZDtcbnZhciBlYXNlSW5DdWJpYyA9IFtbWzAsIDFdXSwgW1swLjY3OSwgMC42ODhdLCBbMC4zNjYsIDAuOTkyXSwgWzAuOTkyLCAwLjM4NF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkN1YmljID0gZWFzZUluQ3ViaWM7XG52YXIgZWFzZU91dEN1YmljID0gW1tbMCwgMV1dLCBbWzAuMzIxLCAwLjMxMl0sIFswLjAwOCwgMC42MTZdLCBbMC42MzQsIDAuMDA4XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEN1YmljID0gZWFzZU91dEN1YmljO1xudmFyIGVhc2VJbk91dEN1YmljID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuMywgMV0sIFswLjcsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBRdWFydFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRDdWJpYyA9IGVhc2VJbk91dEN1YmljO1xudmFyIGVhc2VJblF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuODEyLCAwLjc0XSwgWzAuNjExLCAwLjk4OF0sIFsxLjAxMywgMC40OTJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5RdWFydCA9IGVhc2VJblF1YXJ0O1xudmFyIGVhc2VPdXRRdWFydCA9IFtbWzAsIDFdXSwgW1swLjE1MiwgMC4yNDRdLCBbMC4wMDEsIDAuNDQ4XSwgWzAuMjg1LCAtMC4wMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWFydCA9IGVhc2VPdXRRdWFydDtcbnZhciBlYXNlSW5PdXRRdWFydCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjQsIDFdLCBbMC42LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUXVpbnRcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0UXVhcnQgPSBlYXNlSW5PdXRRdWFydDtcbnZhciBlYXNlSW5RdWludCA9IFtbWzAsIDFdXSwgW1swLjg1NywgMC44NTZdLCBbMC43MTQsIDFdLCBbMSwgMC43MTJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5RdWludCA9IGVhc2VJblF1aW50O1xudmFyIGVhc2VPdXRRdWludCA9IFtbWzAsIDFdXSwgW1swLjEwOCwgMC4yXSwgWzAuMDAxLCAwLjRdLCBbMC4yMTQsIC0wLjAxMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWludCA9IGVhc2VPdXRRdWludDtcbnZhciBlYXNlSW5PdXRRdWludCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjUsIDFdLCBbMC41LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQmFja1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGVhc2VJbk91dFF1aW50O1xudmFyIGVhc2VJbkJhY2sgPSBbW1swLCAxXV0sIFtbMC42NjcsIDAuODk2XSwgWzAuMzgwLCAxLjE4NF0sIFswLjk1NSwgMC42MTZdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5CYWNrID0gZWFzZUluQmFjaztcbnZhciBlYXNlT3V0QmFjayA9IFtbWzAsIDFdXSwgW1swLjMzNSwgMC4wMjhdLCBbMC4wNjEsIDAuMjJdLCBbMC42MzEsIC0wLjE4XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEJhY2sgPSBlYXNlT3V0QmFjaztcbnZhciBlYXNlSW5PdXRCYWNrID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNCwgMS40XSwgWzAuNiwgLTAuNF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEVsYXN0aWNcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0QmFjayA9IGVhc2VJbk91dEJhY2s7XG52YXIgZWFzZUluRWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjQ3NCwgMC45NjRdLCBbMC4zODIsIDAuOTg4XSwgWzAuNTU3LCAwLjk1Ml1dLCBbWzAuNjE5LCAxLjA3Nl0sIFswLjU2NSwgMS4wODhdLCBbMC42NjksIDEuMDhdXSwgW1swLjc3MCwgMC45MTZdLCBbMC43MTIsIDAuOTI0XSwgWzAuODQ3LCAwLjkwNF1dLCBbWzAuOTExLCAxLjMwNF0sIFswLjg3MiwgMS4zMTZdLCBbMC45NjEsIDEuMzRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5FbGFzdGljID0gZWFzZUluRWxhc3RpYztcbnZhciBlYXNlT3V0RWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjA3MywgLTAuMzJdLCBbMC4wMzQsIC0wLjMyOF0sIFswLjEwNCwgLTAuMzQ0XV0sIFtbMC4xOTEsIDAuMDkyXSwgWzAuMTEwLCAwLjA2XSwgWzAuMjU2LCAwLjA4XV0sIFtbMC4zMTAsIC0wLjA3Nl0sIFswLjI2MCwgLTAuMDY4XSwgWzAuMzU3LCAtMC4wNzZdXSwgW1swLjQzMiwgMC4wMzJdLCBbMC4zNjIsIDAuMDI4XSwgWzAuNjgzLCAtMC4wMDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0RWxhc3RpYyA9IGVhc2VPdXRFbGFzdGljO1xudmFyIGVhc2VJbk91dEVsYXN0aWMgPSBbW1swLCAxXV0sIFtbMC4yMTAsIDAuOTRdLCBbMC4xNjcsIDAuODg0XSwgWzAuMjUyLCAwLjk4XV0sIFtbMC4yOTksIDEuMTA0XSwgWzAuMjU2LCAxLjA5Ml0sIFswLjM0NywgMS4xMDhdXSwgW1swLjUsIDAuNDk2XSwgWzAuNDUxLCAwLjY3Ml0sIFswLjU0OCwgMC4zMjRdXSwgW1swLjY5NiwgLTAuMTA4XSwgWzAuNjUyLCAtMC4xMTJdLCBbMC43NDEsIC0wLjEyNF1dLCBbWzAuODA1LCAwLjA2NF0sIFswLjc1NiwgMC4wMTJdLCBbMC44NjYsIDAuMDk2XV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQm91bmNlXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dEVsYXN0aWMgPSBlYXNlSW5PdXRFbGFzdGljO1xudmFyIGVhc2VJbkJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjE0OCwgMV0sIFswLjA3NSwgMC44NjhdLCBbMC4xOTMsIDAuODQ4XV0sIFtbMC4zMjYsIDFdLCBbMC4yNzYsIDAuODM2XSwgWzAuNDA1LCAwLjcxMl1dLCBbWzAuNjAwLCAxXSwgWzAuNTExLCAwLjcwOF0sIFswLjY3MSwgMC4zNDhdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5Cb3VuY2UgPSBlYXNlSW5Cb3VuY2U7XG52YXIgZWFzZU91dEJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjM1NywgMC4wMDRdLCBbMC4yNzAsIDAuNTkyXSwgWzAuMzc2LCAwLjI1Ml1dLCBbWzAuNjA0LCAtMC4wMDRdLCBbMC41NDgsIDAuMzEyXSwgWzAuNjY5LCAwLjE4NF1dLCBbWzAuODIwLCAwXSwgWzAuNzQ5LCAwLjE4NF0sIFswLjkwNSwgMC4xMzJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0Qm91bmNlID0gZWFzZU91dEJvdW5jZTtcbnZhciBlYXNlSW5PdXRCb3VuY2UgPSBbW1swLCAxXV0sIFtbMC4xMDIsIDFdLCBbMC4wNTAsIDAuODY0XSwgWzAuMTE3LCAwLjg2XV0sIFtbMC4yMTYsIDAuOTk2XSwgWzAuMjA4LCAwLjg0NF0sIFswLjIyNywgMC44MDhdXSwgW1swLjM0NywgMC45OTZdLCBbMC4zNDMsIDAuOF0sIFswLjQ4MCwgMC4yOTJdXSwgW1swLjYzNSwgMC4wMDRdLCBbMC41MTEsIDAuNjc2XSwgWzAuNjU2LCAwLjIwOF1dLCBbWzAuNzg3LCAwXSwgWzAuNzYwLCAwLjJdLCBbMC43OTUsIDAuMTQ0XV0sIFtbMC45MDUsIC0wLjAwNF0sIFswLjg5OSwgMC4xNjRdLCBbMC45NDQsIDAuMTQ0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluT3V0Qm91bmNlID0gZWFzZUluT3V0Qm91bmNlO1xuXG52YXIgX2RlZmF1bHQgPSBuZXcgTWFwKFtbJ2xpbmVhcicsIGxpbmVhcl0sIFsnZWFzZUluU2luZScsIGVhc2VJblNpbmVdLCBbJ2Vhc2VPdXRTaW5lJywgZWFzZU91dFNpbmVdLCBbJ2Vhc2VJbk91dFNpbmUnLCBlYXNlSW5PdXRTaW5lXSwgWydlYXNlSW5RdWFkJywgZWFzZUluUXVhZF0sIFsnZWFzZU91dFF1YWQnLCBlYXNlT3V0UXVhZF0sIFsnZWFzZUluT3V0UXVhZCcsIGVhc2VJbk91dFF1YWRdLCBbJ2Vhc2VJbkN1YmljJywgZWFzZUluQ3ViaWNdLCBbJ2Vhc2VPdXRDdWJpYycsIGVhc2VPdXRDdWJpY10sIFsnZWFzZUluT3V0Q3ViaWMnLCBlYXNlSW5PdXRDdWJpY10sIFsnZWFzZUluUXVhcnQnLCBlYXNlSW5RdWFydF0sIFsnZWFzZU91dFF1YXJ0JywgZWFzZU91dFF1YXJ0XSwgWydlYXNlSW5PdXRRdWFydCcsIGVhc2VJbk91dFF1YXJ0XSwgWydlYXNlSW5RdWludCcsIGVhc2VJblF1aW50XSwgWydlYXNlT3V0UXVpbnQnLCBlYXNlT3V0UXVpbnRdLCBbJ2Vhc2VJbk91dFF1aW50JywgZWFzZUluT3V0UXVpbnRdLCBbJ2Vhc2VJbkJhY2snLCBlYXNlSW5CYWNrXSwgWydlYXNlT3V0QmFjaycsIGVhc2VPdXRCYWNrXSwgWydlYXNlSW5PdXRCYWNrJywgZWFzZUluT3V0QmFja10sIFsnZWFzZUluRWxhc3RpYycsIGVhc2VJbkVsYXN0aWNdLCBbJ2Vhc2VPdXRFbGFzdGljJywgZWFzZU91dEVsYXN0aWNdLCBbJ2Vhc2VJbk91dEVsYXN0aWMnLCBlYXNlSW5PdXRFbGFzdGljXSwgWydlYXNlSW5Cb3VuY2UnLCBlYXNlSW5Cb3VuY2VdLCBbJ2Vhc2VPdXRCb3VuY2UnLCBlYXNlT3V0Qm91bmNlXSwgWydlYXNlSW5PdXRCb3VuY2UnLCBlYXNlSW5PdXRCb3VuY2VdXSk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50cmFuc2l0aW9uID0gdHJhbnNpdGlvbjtcbmV4cG9ydHMuaW5qZWN0TmV3Q3VydmUgPSBpbmplY3ROZXdDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2N1cnZlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29uZmlnL2N1cnZlc1wiKSk7XG5cbnZhciBkZWZhdWx0VHJhbnNpdGlvbkJDID0gJ2xpbmVhcic7XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgTi1mcmFtZSBhbmltYXRpb24gc3RhdGUgYnkgdGhlIHN0YXJ0IGFuZCBlbmQgc3RhdGVcclxuICogICAgICAgICAgICAgIG9mIHRoZSBhbmltYXRpb24gYW5kIHRoZSBlYXNpbmcgY3VydmVcclxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHRCQyAgICAgICAgICAgICAgIEVhc2luZyBjdXJ2ZSBuYW1lIG9yIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ8QXJyYXl8T2JqZWN0fSBzdGFydFN0YXRlIEFuaW1hdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcnxBcnJheXxPYmplY3R9IGVuZFN0YXRlICAgQW5pbWF0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gICAgICAgICAgICAgICAgTnVtYmVyIG9mIEFuaW1hdGlvbiBmcmFtZXNcclxuICogQHBhcmFtIHtCb29sZWFufSBkZWVwICAgICAgICAgICAgICAgICAgIFdoZXRoZXIgdG8gdXNlIHJlY3Vyc2l2ZSBtb2RlXHJcbiAqIEByZXR1cm4ge0FycmF5fEJvb2xlYW59IFN0YXRlIG9mIGVhY2ggZnJhbWUgb2YgdGhlIGFuaW1hdGlvbiAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cbmZ1bmN0aW9uIHRyYW5zaXRpb24odEJDKSB7XG4gIHZhciBzdGFydFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICB2YXIgZW5kU3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gIHZhciBmcmFtZU51bSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMzA7XG4gIHZhciBkZWVwID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBmYWxzZTtcbiAgaWYgKCFjaGVja1BhcmFtcy5hcHBseSh2b2lkIDAsIGFyZ3VtZW50cykpIHJldHVybiBmYWxzZTtcblxuICB0cnkge1xuICAgIC8vIEdldCB0aGUgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcbiAgICB2YXIgYmV6aWVyQ3VydmUgPSBnZXRCZXppZXJDdXJ2ZSh0QkMpOyAvLyBHZXQgdGhlIHByb2dyZXNzIG9mIGVhY2ggZnJhbWUgc3RhdGVcblxuICAgIHZhciBmcmFtZVN0YXRlUHJvZ3Jlc3MgPSBnZXRGcmFtZVN0YXRlUHJvZ3Jlc3MoYmV6aWVyQ3VydmUsIGZyYW1lTnVtKTsgLy8gSWYgdGhlIHJlY3Vyc2lvbiBtb2RlIGlzIG5vdCBlbmFibGVkIG9yIHRoZSBzdGF0ZSB0eXBlIGlzIE51bWJlciwgdGhlIHNoYWxsb3cgc3RhdGUgY2FsY3VsYXRpb24gaXMgcGVyZm9ybWVkIGRpcmVjdGx5LlxuXG4gICAgaWYgKCFkZWVwIHx8IHR5cGVvZiBlbmRTdGF0ZSA9PT0gJ251bWJlcicpIHJldHVybiBnZXRUcmFuc2l0aW9uU3RhdGUoc3RhcnRTdGF0ZSwgZW5kU3RhdGUsIGZyYW1lU3RhdGVQcm9ncmVzcyk7XG4gICAgcmV0dXJuIHJlY3Vyc2lvblRyYW5zaXRpb25TdGF0ZShzdGFydFN0YXRlLCBlbmRTdGF0ZSwgZnJhbWVTdGF0ZVByb2dyZXNzKTtcbiAgfSBjYXRjaCAoX3VudXNlZCkge1xuICAgIGNvbnNvbGUud2FybignVHJhbnNpdGlvbiBwYXJhbWV0ZXIgbWF5IGJlIGFibm9ybWFsIScpO1xuICAgIHJldHVybiBbZW5kU3RhdGVdO1xuICB9XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwYXJhbWV0ZXJzIGFyZSBsZWdhbFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdEJDICAgICAgTmFtZSBvZiB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FueX0gc3RhcnRTdGF0ZSAgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FueX0gZW5kU3RhdGUgICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGZyYW1lTnVtIE51bWJlciBvZiB0cmFuc2l0aW9uIGZyYW1lc1xyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBJcyB0aGUgcGFyYW1ldGVyIGxlZ2FsXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUGFyYW1zKHRCQykge1xuICB2YXIgc3RhcnRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIHZhciBlbmRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBmcmFtZU51bSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMzA7XG5cbiAgaWYgKCF0QkMgfHwgc3RhcnRTdGF0ZSA9PT0gZmFsc2UgfHwgZW5kU3RhdGUgPT09IGZhbHNlIHx8ICFmcmFtZU51bSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoc3RhcnRTdGF0ZSkgIT09ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVuZFN0YXRlKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IEluY29uc2lzdGVudCBTdGF0dXMgVHlwZXMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHN0YXRlVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVuZFN0YXRlKTtcblxuICBpZiAoc3RhdGVUeXBlID09PSAnc3RyaW5nJyB8fCBzdGF0ZVR5cGUgPT09ICdib29sZWFuJyB8fCAhdEJDLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IFVuc3VwcG9ydGVkIERhdGEgVHlwZSBvZiBTdGF0ZSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIV9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmhhcyh0QkMpICYmICEodEJDIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS53YXJuKCd0cmFuc2l0aW9uOiBUcmFuc2l0aW9uIGN1cnZlIG5vdCBmb3VuZCwgZGVmYXVsdCBjdXJ2ZSB3aWxsIGJlIHVzZWQhJyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdEJDIE5hbWUgb2YgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHJldHVybiB7QXJyYXl9IEJlemllciBjdXJ2ZSBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlKHRCQykge1xuICB2YXIgYmV6aWVyQ3VydmUgPSAnJztcblxuICBpZiAoX2N1cnZlc1tcImRlZmF1bHRcIl0uaGFzKHRCQykpIHtcbiAgICBiZXppZXJDdXJ2ZSA9IF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmdldCh0QkMpO1xuICB9IGVsc2UgaWYgKHRCQyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgYmV6aWVyQ3VydmUgPSB0QkM7XG4gIH0gZWxzZSB7XG4gICAgYmV6aWVyQ3VydmUgPSBfY3VydmVzW1wiZGVmYXVsdFwiXS5nZXQoZGVmYXVsdFRyYW5zaXRpb25CQyk7XG4gIH1cblxuICByZXR1cm4gYmV6aWVyQ3VydmU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gICBOdW1iZXIgb2YgdHJhbnNpdGlvbiBmcmFtZXNcclxuICogQHJldHVybiB7QXJyYXl9IFByb2dyZXNzIG9mIGVhY2ggZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RnJhbWVTdGF0ZVByb2dyZXNzKGJlemllckN1cnZlLCBmcmFtZU51bSkge1xuICB2YXIgdE1pbnVzID0gMSAvIChmcmFtZU51bSAtIDEpO1xuICB2YXIgdFN0YXRlID0gbmV3IEFycmF5KGZyYW1lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAodCwgaSkge1xuICAgIHJldHVybiBpICogdE1pbnVzO1xuICB9KTtcbiAgdmFyIGZyYW1lU3RhdGUgPSB0U3RhdGUubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIGdldEZyYW1lU3RhdGVGcm9tVChiZXppZXJDdXJ2ZSwgdCk7XG4gIH0pO1xuICByZXR1cm4gZnJhbWVTdGF0ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwcm9ncmVzcyBvZiB0aGUgY29ycmVzcG9uZGluZyBmcmFtZSBhY2NvcmRpbmcgdG8gdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7TnVtYmVyfSBQcm9ncmVzcyBvZiBjdXJyZW50IGZyYW1lXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEZyYW1lU3RhdGVGcm9tVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgdEJlemllckN1cnZlUG9pbnQgPSBnZXRCZXppZXJDdXJ2ZVBvaW50RnJvbVQoYmV6aWVyQ3VydmUsIHQpO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludFQgPSBnZXRCZXppZXJDdXJ2ZVBvaW50VEZyb21SZVQodEJlemllckN1cnZlUG9pbnQsIHQpO1xuICByZXR1cm4gZ2V0QmV6aWVyQ3VydmVUU3RhdGUodEJlemllckN1cnZlUG9pbnQsIGJlemllckN1cnZlUG9pbnRUKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb3JyZXNwb25kaW5nIHN1Yi1jdXJ2ZSBhY2NvcmRpbmcgdG8gdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7QXJyYXl9IFN1Yi1jdXJ2ZSBvZiB0XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlUG9pbnRGcm9tVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgbGFzdEluZGV4ID0gYmV6aWVyQ3VydmUubGVuZ3RoIC0gMTtcbiAgdmFyIGJlZ2luID0gJycsXG4gICAgICBlbmQgPSAnJztcbiAgYmV6aWVyQ3VydmUuZmluZEluZGV4KGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgaWYgKGkgPT09IGxhc3RJbmRleCkgcmV0dXJuO1xuICAgIGJlZ2luID0gaXRlbTtcbiAgICBlbmQgPSBiZXppZXJDdXJ2ZVtpICsgMV07XG4gICAgdmFyIGN1cnJlbnRNYWluUG9pbnRYID0gYmVnaW5bMF1bMF07XG4gICAgdmFyIG5leHRNYWluUG9pbnRYID0gZW5kWzBdWzBdO1xuICAgIHJldHVybiB0ID49IGN1cnJlbnRNYWluUG9pbnRYICYmIHQgPCBuZXh0TWFpblBvaW50WDtcbiAgfSk7XG4gIHZhciBwMCA9IGJlZ2luWzBdO1xuICB2YXIgcDEgPSBiZWdpblsyXSB8fCBiZWdpblswXTtcbiAgdmFyIHAyID0gZW5kWzFdIHx8IGVuZFswXTtcbiAgdmFyIHAzID0gZW5kWzBdO1xuICByZXR1cm4gW3AwLCBwMSwgcDIsIHAzXTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IGxvY2FsIHQgYmFzZWQgb24gdCBhbmQgc3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFN1Yi1jdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7TnVtYmVyfSBsb2NhbCB0IG9mIHN1Yi1jdXJ2ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZVBvaW50VEZyb21SZVQoYmV6aWVyQ3VydmUsIHQpIHtcbiAgdmFyIHJlQmVnaW5YID0gYmV6aWVyQ3VydmVbMF1bMF07XG4gIHZhciByZUVuZFggPSBiZXppZXJDdXJ2ZVszXVswXTtcbiAgdmFyIHhNaW51cyA9IHJlRW5kWCAtIHJlQmVnaW5YO1xuICB2YXIgdE1pbnVzID0gdCAtIHJlQmVnaW5YO1xuICByZXR1cm4gdE1pbnVzIC8geE1pbnVzO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnZlIHByb2dyZXNzIG9mIHRcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgU3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFByb2dyZXNzIG9mIGN1cnJlbnQgZnJhbWVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVUU3RhdGUoX3JlZiwgdCkge1xuICB2YXIgX3JlZjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZiwgNCksXG4gICAgICBfcmVmMiQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMF0sIDIpLFxuICAgICAgcDAgPSBfcmVmMiRbMV0sXG4gICAgICBfcmVmMiQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzFdLCAyKSxcbiAgICAgIHAxID0gX3JlZjIkMlsxXSxcbiAgICAgIF9yZWYyJDMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMl0sIDIpLFxuICAgICAgcDIgPSBfcmVmMiQzWzFdLFxuICAgICAgX3JlZjIkNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlszXSwgMiksXG4gICAgICBwMyA9IF9yZWYyJDRbMV07XG5cbiAgdmFyIHBvdyA9IE1hdGgucG93O1xuICB2YXIgdE1pbnVzID0gMSAtIHQ7XG4gIHZhciByZXN1bHQxID0gcDAgKiBwb3codE1pbnVzLCAzKTtcbiAgdmFyIHJlc3VsdDIgPSAzICogcDEgKiB0ICogcG93KHRNaW51cywgMik7XG4gIHZhciByZXN1bHQzID0gMyAqIHAyICogcG93KHQsIDIpICogdE1pbnVzO1xuICB2YXIgcmVzdWx0NCA9IHAzICogcG93KHQsIDMpO1xuICByZXR1cm4gMSAtIChyZXN1bHQxICsgcmVzdWx0MiArIHJlc3VsdDMgKyByZXN1bHQ0KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRyYW5zaXRpb24gc3RhdGUgYWNjb3JkaW5nIHRvIGZyYW1lIHByb2dyZXNzXHJcbiAqIEBwYXJhbSB7QW55fSBzdGFydFN0YXRlICAgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FueX0gZW5kU3RhdGUgICAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIHN0YXRlVHlwZSA9ICdvYmplY3QnO1xuICBpZiAodHlwZW9mIGJlZ2luID09PSAnbnVtYmVyJykgc3RhdGVUeXBlID0gJ251bWJlcic7XG4gIGlmIChiZWdpbiBpbnN0YW5jZW9mIEFycmF5KSBzdGF0ZVR5cGUgPSAnYXJyYXknO1xuICBpZiAoc3RhdGVUeXBlID09PSAnbnVtYmVyJykgcmV0dXJuIGdldE51bWJlclRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcbiAgaWYgKHN0YXRlVHlwZSA9PT0gJ2FycmF5JykgcmV0dXJuIGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICBpZiAoc3RhdGVUeXBlID09PSAnb2JqZWN0JykgcmV0dXJuIGdldE9iamVjdFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcbiAgcmV0dXJuIGZyYW1lU3RhdGUubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIGVuZDtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBudW1iZXIgdHlwZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE51bWJlclRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBtaW51cyA9IGVuZCAtIGJlZ2luO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gYmVnaW4gKyBtaW51cyAqIHM7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gZGF0YSBvZiB0aGUgYXJyYXkgdHlwZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIG1pbnVzID0gZW5kLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdiAtIGJlZ2luW2ldO1xuICB9KTtcbiAgcmV0dXJuIGZyYW1lU3RhdGUubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIG1pbnVzLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgaWYgKHYgPT09IGZhbHNlKSByZXR1cm4gZW5kW2ldO1xuICAgICAgcmV0dXJuIGJlZ2luW2ldICsgdiAqIHM7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gZGF0YSBvZiB0aGUgb2JqZWN0IHR5cGVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlICBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRPYmplY3RUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGVuZCk7XG4gIHZhciBiZWdpblZhbHVlID0ga2V5cy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICByZXR1cm4gYmVnaW5ba107XG4gIH0pO1xuICB2YXIgZW5kVmFsdWUgPSBrZXlzLm1hcChmdW5jdGlvbiAoaykge1xuICAgIHJldHVybiBlbmRba107XG4gIH0pO1xuICB2YXIgYXJyYXlTdGF0ZSA9IGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luVmFsdWUsIGVuZFZhbHVlLCBmcmFtZVN0YXRlKTtcbiAgcmV0dXJuIGFycmF5U3RhdGUubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIGZyYW1lRGF0YSA9IHt9O1xuICAgIGl0ZW0uZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgcmV0dXJuIGZyYW1lRGF0YVtrZXlzW2ldXSA9IHY7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZyYW1lRGF0YTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBzdGF0ZSBkYXRhIGJ5IHJlY3Vyc2lvblxyXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgICAgICAgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJlY3Vyc2lvblRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBzdGF0ZSA9IGdldFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcblxuICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChrZXkpIHtcbiAgICB2YXIgYlRlbXAgPSBiZWdpbltrZXldO1xuICAgIHZhciBlVGVtcCA9IGVuZFtrZXldO1xuICAgIGlmICgoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShlVGVtcCkgIT09ICdvYmplY3QnKSByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgIHZhciBkYXRhID0gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKGJUZW1wLCBlVGVtcCwgZnJhbWVTdGF0ZSk7XG4gICAgc3RhdGUuZm9yRWFjaChmdW5jdGlvbiAoZnMsIGkpIHtcbiAgICAgIHJldHVybiBmc1trZXldID0gZGF0YVtpXTtcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKHZhciBrZXkgaW4gZW5kKSB7XG4gICAgdmFyIF9yZXQgPSBfbG9vcChrZXkpO1xuXG4gICAgaWYgKF9yZXQgPT09IFwiY29udGludWVcIikgY29udGludWU7XG4gIH1cblxuICByZXR1cm4gc3RhdGU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluamVjdCBuZXcgY3VydmUgaW50byBjdXJ2ZXMgYXMgY29uZmlnXHJcbiAqIEBwYXJhbSB7QW55fSBrZXkgICAgIFRoZSBrZXkgb2YgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gY3VydmUgQmV6aWVyIGN1cnZlIGRhdGFcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cclxuICovXG5cblxuZnVuY3Rpb24gaW5qZWN0TmV3Q3VydmUoa2V5LCBjdXJ2ZSkge1xuICBpZiAoIWtleSB8fCAhY3VydmUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdJbmplY3ROZXdDdXJ2ZSBNaXNzaW5nIFBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgX2N1cnZlc1tcImRlZmF1bHRcIl0uc2V0KGtleSwgY3VydmUpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB0cmFuc2l0aW9uO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiJdfQ==
