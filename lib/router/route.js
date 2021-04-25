'use strict';

import Pattern from './pattern.js';

export default class Route {
  constructor () {
    this.children = [];
    this.customName = undefined;
    this.defaultName = undefined;
    this.underRoute = false;
    this.methods = [];
    this.parent = undefined;
    this.pattern = new Pattern();
    this.websocketRoute = false;
  }

  addChild (child) {
    this.children.push(child);
    child.parent = new WeakRef(this);
    return child;
  }

  any (...args) {
    const child = new Route();

    for (const arg of args) {
      if (typeof arg === 'string') {
        child.defaultName = arg.replace(/[^0-9a-z]+/gi, '_').replace(/^_|_$/g, '');
        child.pattern.parse(arg);
      } else if (arg instanceof Array) {
        child.methods = this.methods.concat(arg);
      } else if (arg instanceof Function) {
        child.pattern.defaults.fn = arg;
      } else if (arg instanceof Object) {
        Object.assign(child.pattern.constraints, arg);
      }
    }
    child.pattern.types = this.root().types;

    return this.addChild(child);
  }

  get (...args) {
    return this.any(['GET'], ...args);
  }

  isEndpoint () {
    return !this.children.length > 0;
  }

  name (name) {
    this.customName = name;
    return this;
  }

  post (...args) {
    return this.any(['POST'], ...args);
  }

  render (values = {}) {
    const parts = [];
    const branch = this._branch();
    for (let i = 0; i < branch.length - 1; i++) {
      parts.push(branch[i].pattern.render(values, {isEndpoint: branch[i].isEndpoint()}));
    }
    return parts.reverse().join('');
  }

  root () {
    const branch = this._branch();
    return branch[branch.length - 1];
  }

  to (target = {}) {
    if (typeof target === 'string') {
      const parts = target.split('#');
      this.pattern.defaults.controller = parts[0];
      if (parts.length > 1) this.pattern.defaults.action = parts[1];
    } else if (target instanceof Function) {
      this.pattern.defaults.fn = target;
    } else {
      Object.assign(this.pattern.defaults, target);
    }

    return this;
  }

  under (...args) {
    const child = this.any(...args);
    child.underRoute = true;
    return child;
  }

  websocket (...args) {
    const child = this.any(...args);
    child.websocketRoute = true;
    return child;
  }

  _branch () {
    let current = this;
    const branch = [current];
    while ((current = current.parent) !== undefined) {
      branch.push(current = current.deref());
    }
    return branch;
  }
}