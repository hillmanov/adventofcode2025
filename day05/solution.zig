const std = @import("std");

const Range = struct {
    start: u64,
    end: u64,
};

const Input = struct {
    ranges: []Range,
    ids: []u64,
};

pub fn main() !void {
    var stdout_buf: [4096]u8 = undefined;
    var stdout_writer = std.fs.File.stdout().writer(&stdout_buf);
    const stdout = &stdout_writer.interface;

    var timer = try std.time.Timer.start();

    const input = try getInput();
    defer {
        std.heap.page_allocator.free(input.ranges);
        std.heap.page_allocator.free(input.ids);
    }

    // Part 1
    timer.reset();
    const result1 = try part1(input.ranges, input.ids);
    const time1 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    // Part 2
    timer.reset();
    const result2 = try part2(input.ranges);
    const time2 = @as(f64, @floatFromInt(timer.read())) / 1_000_000.0;

    try stdout.print("{d}\n", .{result1});
    try stdout.print("{d}\n", .{result2});
    try stdout.print("{d:.3}\n", .{time1});
    try stdout.print("{d:.3}\n", .{time2});
    try stdout.flush();
}

fn part1(ranges: []const Range, ids: []const u64) !u64 {
    const consolidated = try consolidateRanges(ranges);
    defer std.heap.page_allocator.free(consolidated);

    var fresh_count: u64 = 0;
    for (ids) |id| {
        for (consolidated) |range| {
            if (id >= range.start and id <= range.end) {
                fresh_count += 1;
                break;
            }
        }
    }

    return fresh_count;
}

fn part2(ranges: []const Range) !u64 {
    const consolidated = try consolidateRanges(ranges);
    defer std.heap.page_allocator.free(consolidated);

    var total_fresh: u64 = 0;
    for (consolidated) |range| {
        total_fresh += (range.end - range.start) + 1;
    }

    return total_fresh;
}

fn consolidateRanges(ranges: []const Range) ![]Range {
    const allocator = std.heap.page_allocator;

    // Sort ranges by start
    var sorted = try allocator.alloc(Range, ranges.len);
    @memcpy(sorted, ranges);

    std.mem.sort(Range, sorted, {}, struct {
        fn lessThan(_: void, a: Range, b: Range) bool {
            return a.start < b.start;
        }
    }.lessThan);

    // Consolidate overlapping ranges
    var consolidated: std.ArrayList(Range) = .empty;
    defer consolidated.deinit(allocator);

    try consolidated.append(allocator, sorted[0]);

    for (sorted[1..]) |range| {
        const prev = &consolidated.items[consolidated.items.len - 1];
        if (range.start <= prev.end) {
            prev.end = @max(range.end, prev.end);
        } else {
            try consolidated.append(allocator, range);
        }
    }

    allocator.free(sorted);

    return try consolidated.toOwnedSlice(allocator);
}

fn getInput() !Input {
    const file = try std.fs.cwd().openFile("input.txt", .{});
    defer file.close();

    const content = try file.readToEndAlloc(std.heap.page_allocator, 1024 * 1024);
    defer std.heap.page_allocator.free(content);

    const trimmed = std.mem.trimRight(u8, content, "\n\r ");

    // Split by double newline
    var sections = std.mem.splitSequence(u8, trimmed, "\n\n");
    const ranges_section = sections.next() orelse return error.InvalidInput;
    const ids_section = sections.next() orelse return error.InvalidInput;

    // Parse ranges
    var range_count: usize = 0;
    for (ranges_section) |c| {
        if (c == '\n') range_count += 1;
    }
    range_count += 1;

    var ranges = try std.heap.page_allocator.alloc(Range, range_count);
    var range_idx: usize = 0;

    var range_lines = std.mem.splitScalar(u8, ranges_section, '\n');
    while (range_lines.next()) |line| {
        if (line.len == 0) continue;

        var parts = std.mem.splitScalar(u8, line, '-');
        const start_str = parts.next() orelse continue;
        const end_str = parts.next() orelse continue;

        ranges[range_idx] = .{
            .start = std.fmt.parseInt(u64, start_str, 10) catch 0,
            .end = std.fmt.parseInt(u64, end_str, 10) catch 0,
        };
        range_idx += 1;
    }

    // Parse IDs
    var id_count: usize = 0;
    for (ids_section) |c| {
        if (c == '\n') id_count += 1;
    }
    id_count += 1;

    var ids = try std.heap.page_allocator.alloc(u64, id_count);
    var id_idx: usize = 0;

    var id_lines = std.mem.splitScalar(u8, ids_section, '\n');
    while (id_lines.next()) |line| {
        if (line.len == 0) continue;

        ids[id_idx] = std.fmt.parseInt(u64, line, 10) catch 0;
        id_idx += 1;
    }

    return .{
        .ranges = ranges[0..range_idx],
        .ids = ids[0..id_idx],
    };
}
