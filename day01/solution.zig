const std = @import("std");

const Rotation = struct {
    direction: enum { L, R },
    amount: u32,
};

pub fn main() !void {
    // Set up stdout with the new Zig 0.15 buffered I/O API
    var stdout_buf: [4096]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&stdout_buf);
    const stdout = &stdout_writer.interface;

    var timer = try std.time.Timer.start();

    const input = try getInput();
    defer std.heap.page_allocator.free(input);

    // Part 1
    timer.reset();
    const result1 = part1(input);
    const time1 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    // Part 2
    timer.reset();
    const result2 = part2(input);
    const time2 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    // Output in a format the runner can parse
    try stdout.print("{d}\n", .{result1});
    try stdout.print("{d}\n", .{result2});
    try stdout.print("{d:.3}\n", .{time1});
    try stdout.print("{d:.3}\n", .{time2});
    try stdout.flush();
}

fn part1(rotations: []const Rotation) u32 {
    var dial: i32 = 50;
    var zero_count: u32 = 0;

    for (rotations) |rotation| {
        if (rotation.direction == .L) {
            dial = @mod(dial - @as(i32, @intCast(rotation.amount)) + 100, 100);
        } else {
            dial = @mod(dial + @as(i32, @intCast(rotation.amount)), 100);
        }

        if (dial == 0) {
            zero_count += 1;
        }
    }

    return zero_count;
}

fn part2(rotations: []const Rotation) u32 {
    var dial: i32 = 50;
    var zero_count: u32 = 0;

    for (rotations) |rotation| {
        if (rotation.direction == .L) {
            for (0..rotation.amount) |_| {
                dial = @mod(dial - 1 + 100, 100);
                if (dial == 0) {
                    zero_count += 1;
                }
            }
        } else {
            for (0..rotation.amount) |_| {
                dial = @mod(dial + 1, 100);
                if (dial == 0) {
                    zero_count += 1;
                }
            }
        }
    }

    return zero_count;
}

fn getInput() ![]Rotation {
    const file = try std.fs.cwd().openFile("input.txt", .{});
    defer file.close();

    const content = try file.readToEndAlloc(std.heap.page_allocator, 1024 * 1024);
    defer std.heap.page_allocator.free(content);

    // Count lines first
    var line_count: usize = 0;
    for (content) |c| {
        if (c == '\n') line_count += 1;
    }
    // Account for last line without newline
    if (content.len > 0 and content[content.len - 1] != '\n') {
        line_count += 1;
    }

    const rotations = try std.heap.page_allocator.alloc(Rotation, line_count);
    var idx: usize = 0;

    var lines = std.mem.splitScalar(u8, std.mem.trimRight(u8, content, "\n"), '\n');
    while (lines.next()) |line| {
        if (line.len == 0) continue;

        const direction: @TypeOf(rotations[0].direction) = if (line[0] == 'L') .L else .R;
        const amount = std.fmt.parseInt(u32, line[1..], 10) catch 0;

        rotations[idx] = .{
            .direction = direction,
            .amount = amount,
        };
        idx += 1;
    }

    return rotations[0..idx];
}
