const std = @import("std");

// 8 directions: U, R, D, L, UR, DR, DL, UL
const Direction = enum(u8) { U, R, D, L, UR, DR, DL, UL };

const OMNI_DIRECTIONS = [_]Direction{ .U, .R, .D, .L, .UR, .DR, .DL, .UL };

const Point = struct {
    row: i32,
    col: i32,
};

fn go(point: Point, dir: Direction) Point {
    return switch (dir) {
        .U => .{ .row = point.row - 1, .col = point.col },
        .R => .{ .row = point.row, .col = point.col + 1 },
        .D => .{ .row = point.row + 1, .col = point.col },
        .L => .{ .row = point.row, .col = point.col - 1 },
        .UR => .{ .row = point.row - 1, .col = point.col + 1 },
        .DR => .{ .row = point.row + 1, .col = point.col + 1 },
        .DL => .{ .row = point.row + 1, .col = point.col - 1 },
        .UL => .{ .row = point.row - 1, .col = point.col - 1 },
    };
}

fn valueAt(floor: [][]u8, point: Point) ?u8 {
    if (point.row < 0 or point.col < 0) return null;
    const row: usize = @intCast(point.row);
    const col: usize = @intCast(point.col);
    if (row >= floor.len) return null;
    if (col >= floor[row].len) return null;
    return floor[row][col];
}

pub fn main() !void {
    var stdout_buf: [4096]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&stdout_buf);
    const stdout = &stdout_writer.interface;

    var timer = try std.time.Timer.start();

    // Part 1 - needs fresh input
    timer.reset();
    const floor1 = try getInput();
    const result1 = part1(floor1);
    const time1 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;
    freeFloor(floor1);

    // Part 2 - needs fresh input since it modifies the grid
    timer.reset();
    const floor2 = try getInput();
    const result2 = part2(floor2);
    const time2 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;
    freeFloor(floor2);

    try stdout.print("{d}\n", .{result1});
    try stdout.print("{d}\n", .{result2});
    try stdout.print("{d:.3}\n", .{time1});
    try stdout.print("{d:.3}\n", .{time2});
    try stdout.flush();
}

fn freeFloor(floor: [][]u8) void {
    for (floor) |row| {
        std.heap.page_allocator.free(row);
    }
    std.heap.page_allocator.free(floor);
}

fn part1(floor: [][]u8) u32 {
    var accessible: u32 = 0;

    for (floor, 0..) |row, r| {
        for (row, 0..) |value, c| {
            if (value == '@') {
                var num_neighbors: u32 = 0;
                const point = Point{ .row = @intCast(r), .col = @intCast(c) };

                for (OMNI_DIRECTIONS) |dir| {
                    if (valueAt(floor, go(point, dir))) |neighbor| {
                        if (neighbor == '@') {
                            num_neighbors += 1;
                        }
                    }
                }

                if (num_neighbors <= 3) {
                    accessible += 1;
                }
            }
        }
    }

    return accessible;
}

fn part2(floor: [][]u8) u32 {
    var accessible: u32 = 0;

    var modified = true;
    while (modified) {
        modified = false;

        for (floor, 0..) |row, r| {
            for (row, 0..) |value, c| {
                if (value == '@') {
                    var num_neighbors: u32 = 0;
                    const point = Point{ .row = @intCast(r), .col = @intCast(c) };

                    for (OMNI_DIRECTIONS) |dir| {
                        if (valueAt(floor, go(point, dir))) |neighbor| {
                            if (neighbor == '@') {
                                num_neighbors += 1;
                            }
                        }
                    }

                    if (num_neighbors < 4) {
                        accessible += 1;
                        modified = true;
                        floor[r][c] = '.';
                    }
                }
            }
        }
    }

    return accessible;
}

fn getInput() ![][]u8 {
    const file = try std.fs.cwd().openFile("input.txt", .{});
    defer file.close();

    const content = try file.readToEndAlloc(std.heap.page_allocator, 1024 * 1024);
    defer std.heap.page_allocator.free(content);

    const trimmed = std.mem.trimRight(u8, content, "\n\r ");

    // Count lines
    var line_count: usize = 0;
    for (trimmed) |c| {
        if (c == '\n') line_count += 1;
    }
    line_count += 1;

    var floor = try std.heap.page_allocator.alloc([]u8, line_count);
    var idx: usize = 0;

    var lines = std.mem.splitScalar(u8, trimmed, '\n');
    while (lines.next()) |line| {
        if (line.len == 0) continue;

        const row = try std.heap.page_allocator.alloc(u8, line.len);
        @memcpy(row, line);
        floor[idx] = row;
        idx += 1;
    }

    return floor[0..idx];
}
