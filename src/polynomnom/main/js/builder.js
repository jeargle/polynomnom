/* JSLint */
/*global console: false, d3: false*/


/**
 * Build Array of numbers evenly spaced across a range
 * @param start {number} - starting point (included)
 * @param stop {number} - stopping pint (not included)
 * @param step {number} - time; default 1
 * @return {Array[number]}
 */
const range = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)


/**
 * Polynomial
 */
class Polynomial {
    coeffs = null
    polyFunc = null

    constructor(coeffs) {
        this.setCoeffs(coeffs)
    }

    /**
     *
     * @param coeff {[number]}
     */
    setCoeffs(coeffs) {
        let model = this
        model.coeffs = coeffs
        model.setPolyFunc()
    }

    /**
     *
     * @param coeff {number}
     * @param idx {number} - index into coefficient list; order of the element
     */
    setCoeff(coeff, idx) {
        let model = this
        model.coeffs[idx] = coeff
        model.setPolyFunc()
    }

    /**
     * Build polyFunc for evaluating Polynomial at a point x
     */
    setPolyFunc() {
        let model = this
        model.polyFunc = (x) => {
            let sum = 0
            for (let i=0; i<model.coeffs.length; i++) {
                if (model.coeffs[i] !== 0) {
                    sum += model.coeffs[i] * x**i
                }
            }
            return sum
        }
    }

    /**
     *
     */
    yArray(xArray) {
        let model = this
        let yArray = []
        for (let i=0; i<xArray.length; i++) {
            yArray.push(model.polyFunc(xArray[i]))
        }
        return yArray
    }
}


/**
 * PolynomialRow
 */
class PolynomialRow {
    el = null
    polynomial = null
    plotter = null

    constructor(polynomial, list) {
        if (polynomial == null) {
            polynomial = new Polynomial([0, 1])
        }
        this.polynomial = polynomial
        this.list = list
    }

    setEl(el) {
        this.el = el
    }

    remove() {
        console.log('PolynomialRow.remove()')
        let view = this

        view.list.removePolynomial(view)
        view.list.plot()
    }

    render() {
        let view = this

        let terms = view.el.selectAll('span')
            .data(view.polynomial.coeffs)
        terms.enter()
            .append('div')
            .classed('term', true)
            .each(function(d, i) {
                view.addTerm.apply(view, [this, d, i])
            })
        terms.exit().remove()

        let controls = view.el.append('div')
            .classed('row-controls', true)

        // Delete button
        controls.append('button')
            .classed('row-delete', true)
            .on('click', view.remove.bind(view))
            .text('Delete')
    }

    /**
     * Add editable term to polynomial display
     * @param span {span} - span element
     * @param coeff {number} - coefficient for this term
     * @param idx {number} - index into coefficient list
     */
    addTerm(span, coeff, idx) {
        let view = this
        let term = d3.select(span)
        if (idx > 0) {
            term.append('div')
                .classed('term-sign', true)
                .text('+')
        }
        term.append('input')
            .classed('term-coefficient', true)
            .property('type', 'text')
            .property('value', coeff)
            .on('blur', function() {
                view.polynomial.setCoeff(this.value, idx)
                view.list.plot()
            })
            .on('keydown', function (d, e) {
                if (d3.event.code == 'Enter') {
                    // Enter key pressed
                    $(this).blur()
                }
            })
        term.append('div')
            .classed('term-order', true)
            .text('x')
            .append('sup')
            .text(parseInt(idx))
    }
}


/**
 * PolynomialList
 */
class PolynomialList {
    elId = '#polynomial-list'
    el = null
    rows = null
    plotter = null

    constructor(polynomials=[], elId) {
        this.rows = []
        for (let i=0; i<polynomials.length; i++) {
            this.rows.push(new PolynomialRow(polynomials[i], this))
        }
        if (elId != null) {
            this.elId = elId
        }
        this.el = d3.select(this.elId)

        this.plotter = new Plotter(
            'plot',
            this.rows.map(r => r.polynomial),
            range(-5, 5.5, 0.5)
        )

        this.render()
    }

    render() {
        let view = this
        let ul = view.el.selectAll('#polynomials')
        let li = ul.selectAll('li')
            .data(view.rows)
        li.enter()
            .append('li')
            .each(function(d) {
                view.addRow.apply(view, [this, d])
            })
        li.exit().remove()
        // li.order()

        view.plot()
    }

    plot() {
        this.plotter.plot()
    }

    /**
     * Add Polynomial to list
     * @param polynomial {Polynomial}
     * @param idx {number} - index into polynomial list
     */
    addRow(li, row) {
        let view = this

        let rowLi = d3.select(li)
            .append('div')
            .classed('polynomial-row', true)
        row.setEl(rowLi)
        row.render()
    }

    /**
     * Add Polynomial to list
     * @param polynomial {Polynomial}
     * @param idx {number} - index into polynomial list
     */
    addPolynomial(polynomial, idx) {
        let view = this

        view.plotter.setPolynomials(view.rows.map(row => row.polynomial))
        view.render()
    }

    /**
     * Remove Polynomial from list
     * @param polynomial {PolynomialRow}
     */
    removePolynomial(polynomial) {
        let view = this

        for (let i=0; i<view.rows.length; i++) {
            if (polynomial.id == view.rows[i].id) {
                view.rows.splice(i, 1)
                break
            }
        }

        view.plotter.setPolynomials(view.rows.map(row => row.polynomial))

        view.render()
    }

    /**
     * Remove all Polynomials from list
     */
    clear() {
        let view = this

        view.render()
    }
}


/**
 * Plotter
 */
class Plotter {
    plotId = 'plot'
    polynomials = []
    yMin = null
    yMax = null
    xArray = []     // set of points on x-axis

    constructor(plotId='plot', polynomials, xArray=[]) {
        this.plotId = plotId
        this.polynomials = polynomials
        this.xArray = xArray
    }

    /**
     * Set Polynomial list
     * @param polynomials {Array} - array of Polynomials
     */
    setPolynomials(polynomials) {
        this.polynomials = polynomials
    }

    /**
     * Set xArray
     * @param xArray {array} - x-axis coordinates
     */
    setXArray(xArray) {
        this.xArray = xArray
    }

    /**
     * Plot the Polynomials
     */
    plot() {
        let model = this
        let plotDiv = document.getElementById(model.plotId)
        let plotData = []

        for (let i=0; i<model.polynomials.length; i++) {
            plotData.push({
                x: model.xArray,
                y: model.polynomials[i].yArray(model.xArray)
            })
        }

        Plotly.newPlot(
            plotDiv,
            plotData,
            { margin: { t: 0 } }
        )
    }
}


$(document).ready(function() {
    'use strict'

    let pl = new PolynomialList([
        new Polynomial([0, 1, 4]),
        new Polynomial([0, 1, 2, 1])
    ])
})
