"use strict";

var optionsDOM = document.getElementsByClassName("options")[0];
var headerDOM = document.getElementsByClassName("header")[0];
var headerNameDOM = document.getElementsByClassName("header_name")[0];
var gameBoardDOM = document.getElementsByClassName("game")[0];
var startButton = document.getElementsByClassName("start")[0];
var pauseButton = document.getElementsByClassName("pause")[0];
var gameOverElem = document.getElementsByClassName("game-over")[0];
var highScore = document.getElementsByClassName("high-score")[0];
var scoreElem = document.getElementsByClassName("score")[0];
var pausedTime = 59;
var selectedLevel = undefined;
var canvas = document.getElementById("myCanvas").getContext("2d");
var renderFood = 0;
var foodList = [];
var bugList = [];
var timingList = [0];
var minH = 120;
var maxH = 600;
var maxW = 400;
var count = 60;
var timer = null;
var score = 0;
var blackType = {1:true, 2:true, 3:true};
var redType = {4:true, 5:true, 6:true};
var orangeType = {7:true, 8:true, 9:true, 10:true};
var fps = 60;
var pause = false;
var gameOverBool = false;

function load() {
    if (!localStorage.highScore2)
        localStorage.highScore2 = 0;

    if (!localStorage.highScore1){
        localStorage.highScore1 = 0;
        highScore.innerHTML = "High Score: " + "0";
    }
    else {
        highScore.innerHTML = "High Score: " + localStorage.highScore1.toString();
    }
    scoreElem.innerHTML = "Score: 0";
}
window.onload = load;

var gameOver = function(){
    gameOverBool = true;
    clearInterval(timer);
    timer = null
    if (selectedLevel == 1){
        localStorage.highScore1 = score > localStorage.highScore1? score : localStorage.highScore1;

        selectedLevel++;

        document.getElementsByClassName("timer")[0].innerHTML = "60 sec"
        count = 60;
        pausedTime = 59;
        startTimer();
        foodList = [];
        bugList = [];
        timingList = [0];


        score=0;
        scoreElem.innerHTML = "Score: " + score.toString();
        computeBugReleases();

        requestAnimationFrame(frame); // start the first frame
        gameOverBool = false;


    }
    else if (selectedLevel == 2){
        localStorage.highScore2 = score > localStorage.highScore2? score : localStorage.highScore2;
        highScore.innerHTML = "High Score: " + localStorage.highScore2;

        score = 0;
        selectedLevel = 1;
        foodList = [];
        bugList = [];
        timingList = [0];
        count = 60;
        pausedTime = 59;
        gameOverBool = true;
        renderFood = 0;

        document.getElementsByName('level')[1].checked = true;

        gameBoardDOM.style.display = 'none';
        optionsDOM.style.display = 'block';
        gameOverElem.style.display = 'block';
        headerDOM.style.display = 'block';
        headerNameDOM.style.display = 'block';
    }


}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

document.getElementById("myCanvas").onclick = function (e) {
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    if (!pause)
        for (var index in bugList){
            var bug = bugList[index];
            if ((x >= bug.x-20 && x <= (bug.x + 20) && y >= bug.y-30 && y <= (bug.y+10) && !bug.clicked)){
                score += bug.point;
                scoreElem.innerHTML = "Score: " + score.toString();
                bugList[index].clicked = true;
            }
        }
};

var startTimer = function () {
    count = pausedTime, timer = setInterval(function() {
    document.getElementsByClassName("timer")[0].innerHTML = count.toString() + " sec";
    count--;
    if(count == 0) {clearInterval(timer); gameOver();}
    }, 1000);
}

var getSelectedLevel = function() {
    var radios = document.getElementsByName('level');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return undefined;
}

startButton.onclick = function() {
    optionsDOM.style.display = 'none';
    gameBoardDOM.style.display = 'block';
    headerDOM.style.display = 'none';
    headerNameDOM.style.display = 'none';
    count = 60;
    document.getElementsByClassName("timer")[0].innerHTML = "60 sec";
    gameOverBool = false;
    score = 0;
    scoreElem.innerHTML = "Score: 0";
    selectedLevel = getSelectedLevel();
    computeBugReleases();
    startTimer();

    requestAnimationFrame(frame);
};

document.getElementById("radio1").onclick = function(e){
    highScore.innerHTML = "High Score: " + localStorage.highScore1.toString();
}

document.getElementById("radio2").onclick = function(e){
    highScore.innerHTML = "High Score: " + localStorage.highScore2.toString();
}

pauseButton.onclick = function() {
    if (pause){
        pauseButton.innerHTML = "||";
        pause = false;
        count = pausedTime;
        startTimer();
    }
    else {
        pauseButton.innerHTML = "&#9658";
        pause = true;
        pausedTime = count;
        clearInterval(timer);
        timer = null;
    }
};



class Point {
    constructor (x, y){
        this.x = x;
        this.y = y;
    }
}

class BugPoint {
    constructor (x, y, rotation){
        this.x = x;
        this.y = y;
        this.rotate = rotation;
    }
}

class RedBug {
    constructor (x, y){
        this.x = x;
        this.y = y;
        this.kind="red";
        this.point = 3;
        this.color = "#FF4136";
        this.speed = selectedLevel == 1? 75 : 100;
        this.rotate = 0;
        this.clicked = false;
        this.opacity = 1;
    }
}

class OrangeBug {
    constructor (x, y){
        this.x = x;
        this.y = y;
        this.kind="orange";
        this.point = 1;
        this.color = "#FF851B";
        this.speed = selectedLevel == 1? 60: 80;
        this.rotate = 0;
        this.clicked = false;
        this.opacity = 1;
    }
}

class BlackBug {
    constructor (x, y){
        this.x = x;
        this.y = y;
        this.kind="black";
        this.point = 5;
        this.color = "#111111";
        this.speed = selectedLevel == 1? 150 : 200;
        this.rotate = 0;
        this.clicked = false;
        this.opacity = 1;
    }
}

var computeBugReleases = function(){
    var total = 0;
    while (total < 60){
        var wait = randomTime();
        total += wait;
        timingList.push(timingList[timingList.length-1] + wait);
    }
}

var randomTime = function ()
    {
        return Math.floor(Math.random() * 3) + 1;
    }

var randomBugPos = function () {
    return Math.floor(Math.random()*(390-10+1)+10);
}

var randomY = function ()
    {
        return Math.floor(Math.random()*((maxH-20)-minH+1)+minH);
    }

var randomX = function ()
    {
        return Math.floor(Math.random()*(maxW-30)+30);
    }

var drawFood = function (){
    canvas.clearRect(0, 0, 400, 600);
    if (foodList.length === 0)
        for (var i = 0; i < 5; i++){
            var x = randomX();
            var y = randomY();
            var overlap = true;
            while (overlap){
                if (foodList.length === 0)
                    overlap = false;
                else{

                    for (var j = 0; j < foodList.length; j++){
                        var f = foodList[j];
                        if (x <= f.x + 20 && x >= f.x - 20 && y <= f.y + 20 && y >= f.y - 20)
                            {
                                x = randomX();
                                y = randomY();
                                overlap = true;
                                break;
                            }
                        else
                            overlap = false;
                    }
                }
            }


            var point = new Point(x, y);
            foodList.push(point);
        }
    else
      for (var j = 0; j < foodList.length; j++)
      {
          var x = foodList[j].x;
          var y = foodList[j].y;
          canvas.beginPath();
          canvas.fillStyle = 'red';
          canvas.arc(x, y, 10, 10, Math.PI, true);
          canvas.fill();
          canvas.closePath();
          canvas.stroke();
          canvas.beginPath();
          canvas.fillStyle = 'green';
          canvas.moveTo(x, y-10);
          canvas.lineTo(x+12, y-13);
          canvas.lineTo(x+10, y-9);
          canvas.lineTo(x, y-10);
          canvas.fill();
          canvas.strokeStyle = '#550000';
          canvas.closePath();
          canvas.stroke();

          canvas.beginPath();
          canvas.fillStyle = 'green';
          canvas.moveTo(x, y-10);
          canvas.lineTo(x-12, y-13);
          canvas.lineTo(x-9, y-9);
          canvas.lineTo(x, y-10);
          canvas.fill();
          canvas.strokeStyle = '#550000';
          canvas.closePath();
          canvas.stroke();

          canvas.beginPath();
          canvas.fillStyle = 'green';
          canvas.moveTo(x, y-10);
          canvas.lineTo(x-5, y-6);
          canvas.lineTo(x-4, y-3);
          canvas.lineTo(x, y-10);
          canvas.fill();
          canvas.strokeStyle = '#550000';
          canvas.closePath();
          canvas.stroke();

          canvas.beginPath();
          canvas.fillStyle = 'green';
          canvas.moveTo(x, y-10);
          canvas.lineTo(x+5, y-6);
          canvas.lineTo(x+4, y-3);
          canvas.lineTo(x, y-10);
          canvas.fill();
          canvas.strokeStyle = '#550000';
          canvas.closePath();
          canvas.stroke();
      }







}

var checkFoodRender = function (){


        drawFood();
}

var computeBugType = function(){
    var number = Math.floor(Math.random() * 10) + 1;
    if (number in blackType)
        return "black";
    if (number in redType)
        return "red";
    if (number in orangeType)
        return "orange";
}

var initBug = function(type){
    var rPos = randomBugPos();
    var bug;
    if (type === "black"){
        bug = new BlackBug(rPos, 0);
    }
    else if (type === "red"){
        bug = new RedBug(rPos, 0);
    }
    else if (type === "orange"){
        bug = new OrangeBug(rPos, 0);
    }
    bugList.push(bug);
}


var setBugPosition = function(bug, p){
    bug.x = p.x;
    bug.y = p.y;
    bug.rotate =  p.rotate;;
}

var checkNearFood = function(bug){
    for (var index in foodList){
        var food = foodList[index];
        var xupper = food.x + 20;
        var xlower = food.x -20;
        var yupper = food.y + 20;
        var ylower = food.y - 20;
        if ((bug.x <= xupper) && (bug.x >= xlower) && (bug.y <= yupper) && (bug.y >= ylower)){
            // eat food
            foodList.splice(index, 1);
        }
    }
}


var updateBugLogic = function(bug){
    var pixelDistance = bug.speed/fps;
    var foodMin = [];
    if (foodList.length === 0)
        gameOver();
    for (var index in foodList){
        var food = foodList[index];
        var dist = Math.sqrt( Math.pow((bug.x-food.x), 2) + Math.pow((bug.y-food.y), 2) );
        foodMin.push({
            d : dist,
            item : food
        });
    }


    var closestFood = foodMin.reduce(function(prev, curr) {
                            return prev.d < curr.d ? prev : curr;
                       }).item;

    var ul = new BugPoint(bug.x - pixelDistance, bug.y - pixelDistance, 135* Math.PI / 180);
    var um = new BugPoint(bug.x , bug.y - pixelDistance, 180* Math.PI / 180);
    var ur = new BugPoint(bug.x + pixelDistance , bug.y - pixelDistance, -135* Math.PI / 180);

    var ml = new BugPoint(bug.x - pixelDistance, bug.y, 90* Math.PI / 180);
    var mm = new BugPoint(bug.x, bug.y, 0* Math.PI / 180);
    var mr = new BugPoint(bug.x + pixelDistance , bug.y, -90* Math.PI / 180);

    var bl = new BugPoint(bug.x - pixelDistance, bug.y + pixelDistance, 45 * Math.PI / 180);
    var bm = new BugPoint(bug.x , bug.y + pixelDistance, 0 * Math.PI / 180);
    var br = new BugPoint(bug.x + pixelDistance , bug.y + pixelDistance, -45 * Math.PI / 180);

    var posArr = [ul, um, ur, ml, mm, mr, bl, bm, br];
    var minPos = [];
loop1:
    for (var index in posArr){
        var pos = posArr[index];
    loop2:
        for (var i in bugList){
            var bugg = bugList[i];

                if (bug != bugg)
                    if (pos.x < bugg.x + 20  && pos.x + 20  > bugg.x &&
        		        pos.y < bugg.y + 50 && pos.y + 50 > bugg.y){
                        posArr.splice(index, 1);
                        break loop2;
                    }

        }
    }

    //posArr.push(mm); //If no other position is feasible, stay in current position

    for (var index in posArr){
        var pos = posArr[index];
        var dist = Math.sqrt( Math.pow((pos.x-closestFood.x), 2) + Math.pow((pos.y-closestFood.y), 2) );
        minPos.push({
            d : dist,
            item : pos
        });
    }

    var closestPoint = minPos.reduce(function(prev, curr) {
                            return prev.d < curr.d ? prev : curr;
                       }).item;

    setBugPosition(bug, closestPoint);
    checkNearFood(bug);
}

var renderBug = function (bug){
    canvas.save();
    canvas.globalAlpha = bug.opacity;
    var color = bug.color;
    var x = bug.x;
    var y = bug.y;
    canvas.translate(x, y);
    var x = 0;
    var y = 0;
    canvas.rotate(bug.rotate);

    canvas.beginPath();
              canvas.fillStyle = color;
              canvas.arc(x, y, 8, 10, Math.PI, true);
              canvas.fill();
              canvas.closePath();
              canvas.stroke();

              canvas.beginPath();
              canvas.fillStyle = color;
              canvas.arc(x, y-17, 10, 13, Math.PI, true);
              canvas.fill();
              canvas.closePath();
              canvas.stroke();



    canvas.beginPath();
              canvas.fillStyle = 'white';
              canvas.arc(x-4, y-4, 2, 10, Math.PI, true);
              canvas.fill();
              canvas.closePath();

    canvas.beginPath();
              canvas.fillStyle = 'white';
              canvas.arc(x+4, y-4, 2, 10, Math.PI, true);
              canvas.fill();
              canvas.closePath();



     canvas.beginPath();
              canvas.fillStyle = 'black';
              canvas.arc(x-4, y-3, 1, 10, Math.PI, true);
              canvas.fill();
              canvas.closePath();

    canvas.beginPath();
              canvas.fillStyle = 'black';
              canvas.arc(x+4, y-3, 1, 10, Math.PI, true);
              canvas.fill();
              canvas.closePath();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x-8, y);
              canvas.lineTo(x-16, y-7);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();

    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x-16, y-7);
              canvas.lineTo(x-16, y-12);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x-9, y-20);
              canvas.lineTo(x-12, y-25);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x-12, y-25);
              canvas.lineTo(x-12, y-29);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x+8, y);
              canvas.lineTo(x+16, y-7);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x+16, y-7);
              canvas.lineTo(x+16, y-12);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x+10, y-20);
              canvas.lineTo(x+12, y-25);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();



    canvas.beginPath();
              canvas.fillStyle = 'green';
              canvas.moveTo(x+12, y-25);
              canvas.lineTo(x+12, y-29);
              canvas.fill();
              canvas.strokeStyle = '#550000';
              canvas.closePath();
              canvas.stroke();


canvas.beginPath();
     canvas.arc(x, y+3, 5, 0, 1*Math.PI, false);
      canvas.closePath();
      canvas.lineWidth = 1;
      canvas.fillStyle = 'white';
      canvas.fill();
      canvas.strokeStyle = '#550000';
      canvas.stroke();

    canvas.restore();
}

var checkNewBugRender = function() {
    if (count <= timingList[timingList.length-1]){ // Margin of error when you '=' because of timing inconsistency
        var type = computeBugType();
        initBug(type);
        timingList.pop();
    }
}

var updateBugs = function(){
    for (var index in bugList){
        var bug = bugList[index];

        if (bug.clicked){  // Fades the bug out
            if (bug.opacity < 0)
                bugList.splice(index, 1);

            else{
                bug.opacity = bug.opacity - (1/(120));
                renderBug(bug);
            }
        }
        else
        {
            updateBugLogic(bug);
            renderBug(bug);
        }
    }
}

var update = function () {
    canvas.clearRect(0,0,600, 400);
    checkFoodRender(); // loads the food onto map
    checkNewBugRender();
    updateBugs();
}

function frame() { // 60 fps
    if (!pause && !gameOverBool)
        update();
    requestAnimationFrame(frame); // request the next frame
}
