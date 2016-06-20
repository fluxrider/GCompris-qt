/* GCompris - crane.js
 *
 * Copyright (C) 2016 Stefan Toncu <stefan.toncu29@gmail.com>
 *
 * Authors:
 *   <Marc BRUN> (GTK+ version)
 *   Stefan Toncu <stefan.toncu29@gmail.com> (Qt Quick port)
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation; either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program; if not, see <http://www.gnu.org/licenses/>.
 */
.pragma library
.import QtQuick 2.0 as Quick
.import "qrc:/gcompris/src/core/core.js" as Core


var currentLevel = 0
var numberOfLevel = 10
var items
var url = "qrc:/gcompris/src/activities/crane/resource/"

var howManyFigures = [3,3,3,4,5,5,6,7,8,9,10,11,12,13]
var allNames = ["bulb.png","letter-a.svg","letter-b.svg",
                "rectangle1.svg","rectangle2.svg","square1.png",
                "square2.png","triangle1.svg","triangle2.svg",
                "tux.png","water_drop1.png","water_drop2.png",
                "water_spot1.png","water_spot2.png"]
var words = ["cat","dog","win","good","happy"]
var names = []
var names2 = []

function start(items_) {
    items = items_
    currentLevel = 0
    initLevel()
}

function stop() {
}

function initLevel() {
    items.bar.level = currentLevel + 1

    init()
}

function init() {
    items.columns = 7
    items.rows = 6
    items.gameFinished = false

    setRandomModel()

    //select the first item in the grid
    for(var i = 0; i < items.repeater.count; i++) {
        if (items.repeater.itemAt(i).source != "") {
            items.selected = i
            break
        }
    }

    //set opacity for first item's "selection frame"
    items.repeater.itemAt(items.selected).selected.opacity = 1
}

function setRandomModel(){
    var numbers = []

    for (var i = 0; i < items.columns * items.rows; i++){
        names[i] = ""    // reset the board
        names2[i] = ""
        numbers[i] = i;  // generate columns*rows numbers
    }

    if (currentLevel >= words.length) {
        // randomize the names
        Core.shuffle(allNames)

        //get "howManyFigures[currentLevel]" random numbers
        Core.shuffle(numbers)

        for (i = 0; i < howManyFigures[currentLevel]; i++)
            names[numbers[i]] = url + allNames[i]

        Core.shuffle(numbers)

        for (i = 0; i < howManyFigures[currentLevel]; i++)
            names2[numbers[i]] = url + allNames[i]

    } else {

        var model = setModel()

        for (i = 0; i < model.length; i++) {
            if (model[i] != "") {
                names[i] = model[i]
                names2[i] = model[i]
            }
        }

        Core.shuffle(names)
    }

    items.repeater.model = names.length
    items.modelRepeater.model = names2.length

    for (i = 0; i < names.length; i++) {
        items.repeater.itemAt(i).source = names[i]
        items.repeater.itemAt(i).opac = 0
        items.modelRepeater.itemAt(i).source = names2[i]
    }
}

function setModel() {
    var model = []
    for (var i = 0; i < items.columns * items.rows; i++){
        model[i] = ""
    }

    var randomRow = Math.floor(Math.random() * items.rows)
    var randomCol = Math.floor(Math.random() * items.columns)

    if (items.columns - randomCol - words[currentLevel].length < 0)
        randomCol = randomCol - Math.abs(items.columns - randomCol - words[currentLevel].length)

    for (i=0; i<words[currentLevel].length; i++) {
        model[randomRow * items.columns + randomCol + i] =  url + "Letters/" + words[currentLevel].charAt(i) + ".svg"
    }

    return model
}


function getNextIndex1(index) {

    var length = items.repeater.count

    for (var i = index + 1; i < length; i++) {
        if (items.repeater.itemAt(i).source != "") {
            return i
        }
    }
    for (i = 0; i < index-1; i++) {
        if (items.repeater.itemAt(i).source != "") {
            return i
        }
    }

    return -1;
}


function getNextIndex(source) {
    var length = names.length

    //find index of curent image in ordonated "names" list
    for(var i = 0; i < length; i++)
        if (names[i] == source) {
            break
        }

    //print("indexOf: ", names.indexOf(source))

    //go to next index
    i++

    //bool variable
    var ok = false

    //search from current index
    for (; i<names.length; i++) {
        if (names[i] != "")  {
            ok = true  // the item was found in the right part of the list
            break
        }
    }

    // ok == true only if the image is in the right part of the list
    if (ok==true) {
        for (var j = 0; j<items.repeater.count; j++) {
            if (names[i] == items.repeater.itemAt(j).source) {
                return j
            }
        }
    }
    //ok == false, meaning that we have to start the search from left
    else {   //search from begging of the list
        for (i=0; i<names.length; i++) {
            if (names[i] != "")  {
                ok = true
                //when finding the first image, stop
                break
            }
        }
        //search for the index of that image in the repater and
        //return the index
        for (j = 0; j < items.repeater.count; j++) {
            if (names[i] == items.repeater.itemAt(j).source) {
                return j
            }
        }
    }

    return -1;
}

//touchscreen gestures
function gesture(deltax, deltay) {
    if (Math.abs(deltax) > 40 || Math.abs(deltay) > 40) {
        if (deltax > 30 && Math.abs(deltay) < items.sensivity) {
            move("right")
        } else if (deltax < -30 && Math.abs(deltay) < items.sensivity) {
            move("left")
        } else if (Math.abs(deltax) < items.sensivity && deltay > 30) {
            move("down")
        } else if (Math.abs(deltax) < items.sensivity && deltay < 30) {
            move("up")
        }
    }
}

//depeding on the command, make a move to left/right/up/down or select next item
function move(command) {
    if (items.ok == true && items.gameFinished == false) {
        var item = items.repeater.itemAt(items.selected)
        if (command === "left") {
            if (items.selected % items.columns != 0)
                makeMove(item,-item.width,item.x,-1,"x")
        } else if (command === "right") {
            if ((items.selected+1) % items.columns != 0)
                makeMove(item,item.width,item.x,1,"x")
        } else if (command === "up") {
            if (items.selected > items.columns-1)
                makeMove(item,-item.height,item.y,-items.columns,"y")
        } else if (command === "down") {
            if (items.selected < (items.repeater.count-items.columns))
                makeMove(item,item.height,item.y,items.columns,"y")
        } else if (command === "next") {
            items.repeater.itemAt(items.selected).selected.opacity = 0
            items.selected = (currentLevel < words.length) ? getNextIndex1(items.selected) : getNextIndex(items.repeater.itemAt(items.selected).source)
            items.repeater.itemAt(items.selected).selected.opacity = 1
        }
    }
}

//set the environment for making a move and start the animation
function makeMove(item,distance,startPoint,add,animationProperty) {
    if (items.repeater.itemAt(items.selected+add).source == "") {
        //setup the animation
        item.distance = distance
        item.indexChange = add
        item.startPoint = startPoint
        item.animationProperty = animationProperty

        //start the animation
        item.anim.start()

        //update the selected item
        items.selected += add;
    }
}

//check the answer; advance to next level if the answer is good
function checkAnswer() {
    var count = 0
    for (var i = 0; i < items.repeater.count; i++) {
        if (items.repeater.itemAt(i).source != items.modelRepeater.itemAt(i).source){
            count = -1
        }
    }
    if (count == 0) {
        items.bonus.good("flower")
        items.gameFinished = true
    }
}

function nextLevel() {
    if(numberOfLevel <= ++currentLevel ) {
        currentLevel = 0
    }
    initLevel();
}

function previousLevel() {
    if(--currentLevel < 0) {
        currentLevel = numberOfLevel - 1
    }
    initLevel();
}