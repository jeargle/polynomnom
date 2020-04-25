/* JSLint */
/*global console: false, extend: false*/


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

    setCoeffs(coeffs) {
        let model = this
        model.coeffs = coeffs
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
    y(xArray) {
        let model = this
        let yArray = []
        for (let i=0; i<xArray.length; i++) {
            yArray.push(model.polyfunc(xArray[i]))
        }
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

    constructor(plotId='plot', xArray=[]) {
        this.plotId = plotId
        this.xArray = xArray
    }

    /**
     * Set ecosym model
     * @param ecoModel {Object} - ecosym model
     */
    setEcoModel(ecoModel) {
        this.ecoModel = ecoModel
    }

    /**
     * Set xArray
     * @param xArray {array} - x-axis coordinates
     */
    setXArray(xArray) {
        this.xArray = xArray
    }

    /**
     * Plot the ecosym model
     */
    plot() {
        let model = this
        let plotDiv = document.getElementById(model.plotId)
        let plotData = []
        for (let i=0; i<model.polynomials.length; i++) {
            plotData.push({
                x: model.xArray,
                y: model.polynomials[i].y(model.xArray)
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

    let plotter1 = new Plotter(
        'plot',
        new Polynomial(),
        range(0, 201, 20)
    )
    plotter1.plot()
})
