const std = @import("std");

pub fn main() !void {
    var stdout_buf: [4096]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&stdout_buf);
    const stdout = &stdout_writer.interface;

    var timer = try std.time.Timer.start();

    const input = try getInput();
    defer {
        for (input) |row| {
            std.heap.page_allocator.free(row);
        }
        std.heap.page_allocator.free(input);
    }

    // Part 1
    timer.reset();
    const result1 = part1(input);
    const time1 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    // Part 2
    timer.reset();
    const result2 = part2(input);
    const time2 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    try stdout.print("{d}\n", .{result1});
    try stdout.print("{d}\n", .{result2});
    try stdout.print("{d:.3}\n", .{time1});
    try stdout.print("{d:.3}\n", .{time2});
    try stdout.flush();
}

fn part1(banks: []const []const u8) u64 {
    var sum: u64 = 0;

    for (banks) |bank| {
        // Find max in all but last element (dropRight)
        const all_but_last = bank[0 .. bank.len - 1];
        var max_left: u8 = 0;
        var index_left: usize = 0;
        for (all_but_last, 0..) |val, i| {
            if (val > max_left) {
                max_left = val;
                index_left = i;
            }
        }

        // Find max in elements after index_left
        const remaining = bank[index_left + 1 ..];
        var max_right: u8 = 0;
        for (remaining) |val| {
            if (val > max_right) {
                max_right = val;
            }
        }

        sum += @as(u64, max_left) * 10 + @as(u64, max_right);
    }

    return sum;
}

fn part2(banks: []const []const u8) u64 {
    var sum: u64 = 0;

    for (banks) |bank| {
        sum += extractNumber(bank);
    }

    return sum;
}

fn extractNumber(bank: []const u8) u64 {
    var number: [12]u8 = undefined;
    var remaining = bank;

    for (0..12) |i| {
        // At step i (0-indexed), we need to leave enough elements for remaining steps
        // Elements we can look at = remaining.len - (11 - i)
        const elements_to_check = remaining.len - (11 - i);
        if (elements_to_check == 0 or elements_to_check > remaining.len) break;

        var max_val: u8 = 0;
        var max_idx: usize = 0;
        for (remaining[0..elements_to_check], 0..) |val, j| {
            if (val > max_val) {
                max_val = val;
                max_idx = j;
            }
        }

        number[i] = max_val;
        remaining = remaining[max_idx + 1 ..];
    }

    // Convert number array to u64
    var result: u64 = 0;
    for (number) |d| {
        result = result * 10 + d;
    }
    return result;
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
    line_count += 1; // Last line

    var banks = try std.heap.page_allocator.alloc([]u8, line_count);
    var idx: usize = 0;

    var lines = std.mem.splitScalar(u8, trimmed, '\n');
    while (lines.next()) |line| {
        if (line.len == 0) continue;

        var digits = try std.heap.page_allocator.alloc(u8, line.len);
        for (line, 0..) |c, i| {
            digits[i] = c - '0'; // Convert char to digit
        }
        banks[idx] = digits;
        idx += 1;
    }

    return banks[0..idx];
}
