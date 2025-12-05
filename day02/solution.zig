const std = @import("std");

const Range = struct {
    min: u64,
    max: u64,
};

pub fn main() !void {
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

    try stdout.print("{d}\n", .{result1});
    try stdout.print("{d}\n", .{result2});
    try stdout.print("{d:.3}\n", .{time1});
    try stdout.print("{d:.3}\n", .{time2});
    try stdout.flush();
}

fn part1(ranges: []const Range) u64 {
    var invalid_sum: u64 = 0;

    for (ranges) |range| {
        const min_digits = getDigitCount(range.min);
        const max_digits = getDigitCount(range.max);

        // Skip if both min and max have odd digit counts (no even-digit numbers possible)
        if (min_digits % 2 != 0 and max_digits % 2 != 0) {
            continue;
        }

        const lower_bound = getUpperBoundMagnitude(range.min, min_digits, true);
        const upper_bound = getMaxCurrentMagnitude(range.max, max_digits, true);

        // Use stack buffers instead of allocating
        var lower_buf: [20]u8 = undefined;
        var upper_buf: [20]u8 = undefined;

        const lower_len = numToDigitsBuf(lower_bound, &lower_buf);
        const upper_len = numToDigitsBuf(upper_bound, &upper_buf);

        const lower_half_len = lower_len / 2;
        const upper_half_len = upper_len / 2;

        const start = digitsToNum(lower_buf[0..lower_half_len]);
        const end = digitsToNum(upper_buf[0..upper_half_len]);

        var i = start;
        while (i <= end) : (i += 1) {
            const digit_count = getDigitCount(i);
            const multiplier = pow10(digit_count);
            const test_num = i * multiplier + i;

            if (test_num >= range.min and test_num <= range.max) {
                invalid_sum += test_num;
            }
        }
    }

    return invalid_sum;
}

fn part2(ranges: []const Range) u64 {
    // Use a fixed-size array to collect results, then dedupe
    // Maximum possible unique results is bounded by the input
    var results: [10000]u64 = undefined;
    var result_count: usize = 0;

    for (ranges) |range| {
        const min_digits = getDigitCount(range.min);
        const max_digits = getDigitCount(range.max);

        var min_buf: [20]u8 = undefined;
        var max_buf: [20]u8 = undefined;

        const min_len = numToDigitsBuf(range.min, &min_buf);
        const max_len = numToDigitsBuf(range.max, &max_buf);

        // If min has fewer digits than max, prepend a 0
        var working_min_buf: [21]u8 = undefined;
        var working_min: []u8 = undefined;
        var working_min_len: usize = undefined;

        if (min_len < max_len) {
            working_min_buf[0] = 0;
            @memcpy(working_min_buf[1 .. min_len + 1], min_buf[0..min_len]);
            working_min_len = min_len + 1;
            working_min = working_min_buf[0..working_min_len];
        } else {
            working_min = min_buf[0..min_len];
            working_min_len = min_len;
        }

        const len = working_min_len / 2;
        const s = digitsToNum(working_min[0..len]);

        const extra_digits = max_digits - min_digits;
        const e = digitsToNum(max_buf[0 .. len + extra_digits]);

        // Use a simple hash set with a fixed buffer for numbers to check
        // We'll use a bitset-like approach for small numbers and array for larger
        var numbers_to_check: [5000]u64 = undefined;
        var check_count: usize = 0;

        var i = s;
        while (i <= e) : (i += 1) {
            var exploded_buf: [20]u8 = undefined;
            const exploded_len = numToDigitsBuf(i, &exploded_buf);

            for (0..exploded_len + 1) |j| {
                const partial = digitsToNum(exploded_buf[0..j]);
                // Add if not already present (simple linear search for small sets)
                var found = false;
                for (numbers_to_check[0..check_count]) |existing| {
                    if (existing == partial) {
                        found = true;
                        break;
                    }
                }
                if (!found and check_count < numbers_to_check.len) {
                    numbers_to_check[check_count] = partial;
                    check_count += 1;
                }
            }
        }

        // Check each number for repeating pattern
        for (numbers_to_check[0..check_count]) |n| {
            const repeater = doesRepeat(n, range.min, range.max);
            if (repeater > 0) {
                // Add to results if not already present
                var found = false;
                for (results[0..result_count]) |existing| {
                    if (existing == repeater) {
                        found = true;
                        break;
                    }
                }
                if (!found and result_count < results.len) {
                    results[result_count] = repeater;
                    result_count += 1;
                }
            }
        }
    }

    // Sum all unique invalid IDs
    var total: u64 = 0;
    for (results[0..result_count]) |r| {
        total += r;
    }

    return total;
}

fn doesRepeat(num: u64, min: u64, max: u64) u64 {
    if (num == 0) return 0;

    const num_digits = getDigitCount(num);
    const min_digits = getDigitCount(min);
    const max_digits = getDigitCount(max);

    const min_repeats = min_digits / num_digits;
    const max_repeats = max_digits / num_digits;

    // Check min repeats
    if (min_repeats > 1) {
        const min_repeated = repeatNumber(num, num_digits, min_repeats);
        if (min_repeated >= min and min_repeated <= max) {
            return min_repeated;
        }
    }

    // Check max repeats
    if (max_repeats > 1) {
        const max_repeated = repeatNumber(num, num_digits, max_repeats);
        if (max_repeated >= min and max_repeated <= max) {
            return max_repeated;
        }
    }

    return 0;
}

fn repeatNumber(num: u64, digit_count: u64, times: u64) u64 {
    if (times == 0) return 0;
    if (times == 1) return num;

    var result: u64 = num;
    const multiplier = pow10(digit_count);

    var i: u64 = 1;
    while (i < times) : (i += 1) {
        result = result * multiplier + num;
    }

    return result;
}

fn pow10(exp: u64) u64 {
    var result: u64 = 1;
    var i: u64 = 0;
    while (i < exp) : (i += 1) {
        result *= 10;
    }
    return result;
}

fn getDigitCount(num: u64) u64 {
    if (num == 0) return 1;
    return std.math.log10(num) + 1;
}

fn getUpperBoundMagnitude(num: u64, digit_count: u64, skip_even_check: bool) u64 {
    if (digit_count % 2 == 0 and skip_even_check) {
        return num;
    }
    return pow10(digit_count);
}

fn getMaxCurrentMagnitude(num: u64, digit_count: u64, skip_even_check: bool) u64 {
    if (digit_count % 2 == 0 and skip_even_check) {
        return num;
    }
    return pow10(digit_count) - 1;
}

// Convert number to digits in a stack buffer, returns length
fn numToDigitsBuf(num: u64, buf: []u8) usize {
    if (num == 0) {
        buf[0] = 0;
        return 1;
    }

    var n = num;
    var len: usize = 0;

    // Count digits and fill from the end
    var temp: usize = 0;
    var temp_n = num;
    while (temp_n > 0) : (temp_n /= 10) {
        temp += 1;
    }
    len = temp;

    var i = len;
    while (n > 0) {
        i -= 1;
        buf[i] = @intCast(n % 10);
        n /= 10;
    }

    return len;
}

fn digitsToNum(digits: []const u8) u64 {
    var result: u64 = 0;
    for (digits) |d| {
        result = result * 10 + d;
    }
    return result;
}

fn getInput() ![]Range {
    const file = try std.fs.cwd().openFile("input.txt", .{});
    defer file.close();

    const content = try file.readToEndAlloc(std.heap.page_allocator, 1024 * 1024);
    defer std.heap.page_allocator.free(content);

    const trimmed = std.mem.trimRight(u8, content, "\n\r ");

    // Count ranges (comma-separated)
    var range_count: usize = 1;
    for (trimmed) |c| {
        if (c == ',') range_count += 1;
    }

    var ranges = try std.heap.page_allocator.alloc(Range, range_count);
    var idx: usize = 0;

    var range_iter = std.mem.splitScalar(u8, trimmed, ',');
    while (range_iter.next()) |range_str| {
        var parts = std.mem.splitScalar(u8, range_str, '-');
        const min_str = parts.next() orelse continue;
        const max_str = parts.next() orelse continue;

        ranges[idx] = .{
            .min = std.fmt.parseInt(u64, min_str, 10) catch 0,
            .max = std.fmt.parseInt(u64, max_str, 10) catch 0,
        };
        idx += 1;
    }

    return ranges[0..idx];
}
