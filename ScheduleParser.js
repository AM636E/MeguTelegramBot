"use strict";
const xlsx = require("node-xlsx");
const xlsx1 = require("xlsx");
const excelParser = require("excel-parser");
class Lesson {
    constructor(name, room, teacher) {
        this.name = name;
        this.room = room;
        this.teacher = teacher;
        this.name = name;
        this.room = room;
        this.teacher = teacher;
    }
}
class Group {
    constructor(name, lessons) {
        this.name = name;
        this.lessons = lessons;
        this.name = name;
        this.lessons = lessons;
    }
}
class ExcelScheduleParser {
    parse(data) {
        var doc = xlsx1.readFile(data);
        var first_sheet_name = doc.SheetNames[0];
        var worksheet = doc.Sheets[first_sheet_name];
        var result = [];
        ExcelScheduleParser.GroupCells.forEach(element => {
            result.push(this.parseGroupLessons(worksheet, element));
        });
        return result;
    }
    static colName(n) {
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var s = "";
        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s.toUpperCase();
    }
    static getColNumber(col) {
        col = col.toLowerCase();
        var ordA = 'a'.charCodeAt(0);
        var ordZ = 'z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var f = col.charCodeAt(0);
        if (col.length < 2)
            return f - ordA;
        var s = col.charCodeAt(1);
        return len + this.getColNumber(col[1]);
    }
    parseLessonName(worksheet, groupId, val) {
        var lessonCell = groupId + val;
        var lessonCellVal = worksheet[lessonCell];
        return !lessonCellVal ? "--- No Lesson ---" : lessonCellVal.v;
    }
    parseLessonTeacher(worksheet, groupId, val) {
        var teacherCell = worksheet[groupId + (val + 2)];
        return !teacherCell ? "" : teacherCell.v;
    }
    parseLessonNumber(worksheet, groupId, val) {
        var i = val;
        var next = true;
        var colName = groupId;
        var colNumber = ExcelScheduleParser.getColNumber(colName);
        while (i < val + 15 && next) {
            var nextCol = ExcelScheduleParser.colName(colNumber + 1);
            var colAddr = nextCol + val;
            var col = worksheet[colAddr];
            if (col && col.t == "n" && col.v > 1) {
                console.log("Found number for " + groupId + val, col.v);
                return col.v;
            }
            colNumber++;
            i++;
        }
        return -1;
    }
    parseLesson(worksheet, groupId, val) {
        return new Lesson(this.parseLessonName(worksheet, groupId, val), this.parseLessonNumber(worksheet, groupId, val), this.parseLessonTeacher(worksheet, groupId, val));
    }
    parseDay(worksheet, groupId, range) {
        var result = [];
        range.forEach(val => {
            result.push(this.parseLesson(worksheet, groupId, val));
        });
        return result;
    }
    parseGroupLessons(worksheet, groupId) {
        var groupNameId = groupId + "6";
        var group = new Group(worksheet[groupNameId].v, {});
        console.log("Processing ", group.name);
        for (var day = 0; day < 5; day++) {
            var key = Object.keys(ExcelScheduleParser.DayRange)[day];
            var range = ExcelScheduleParser.DayRange[key];
            group.lessons[key] = this.parseDay(worksheet, groupId, range);
        }
        return group;
    }
    parseCourses(data) {
        var defer = new Promise((resolve, reject) => {
            try {
                resolve(this.parse(data));
            }
            catch (e) {
                reject(e);
            }
        });
        return defer;
    }
}
ExcelScheduleParser.NameToNumberLetter = {};
ExcelScheduleParser.DaysCells = ["A8", "A21", "A34", "A47", "A60"];
ExcelScheduleParser.GroupCells = ["C", "J", "S", "Z", "AI", "AP", "AY", "BF", "BO", "BV", "CE"];
ExcelScheduleParser.DayRange = {
    "Monday": [8, 11, 14, 17],
    "Tuesday": [21, 24, 27, 30],
    "Wednesday": [34, 37, 40, 43],
    "Thursday": [47, 50, 53, 56],
    "Friday": [60, 63, 66, 69],
};
exports.ExcelScheduleParser = ExcelScheduleParser;
