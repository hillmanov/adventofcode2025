const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Day 1
    const day01 = b.addExecutable(.{
        .name = "day01",
        .root_module = b.createModule(.{
            .root_source_file = b.path("day01/solution.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(day01);

    // Day 2
    const day02 = b.addExecutable(.{
        .name = "day02",
        .root_module = b.createModule(.{
            .root_source_file = b.path("day02/solution.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(day02);

    // Day 3
    const day03 = b.addExecutable(.{
        .name = "day03",
        .root_module = b.createModule(.{
            .root_source_file = b.path("day03/solution.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(day03);

    // Day 4
    const day04 = b.addExecutable(.{
        .name = "day04",
        .root_module = b.createModule(.{
            .root_source_file = b.path("day04/solution.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(day04);

    // Day 5
    const day05 = b.addExecutable(.{
        .name = "day05",
        .root_module = b.createModule(.{
            .root_source_file = b.path("day05/solution.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    b.installArtifact(day05);

    // Run steps for each day
    const run_day01 = b.addRunArtifact(day01);
    run_day01.setCwd(b.path("day01"));
    const run_step_day01 = b.step("run-day01", "Run Day 01 solution");
    run_step_day01.dependOn(&run_day01.step);

    const run_day02 = b.addRunArtifact(day02);
    run_day02.setCwd(b.path("day02"));
    const run_step_day02 = b.step("run-day02", "Run Day 02 solution");
    run_step_day02.dependOn(&run_day02.step);

    const run_day03 = b.addRunArtifact(day03);
    run_day03.setCwd(b.path("day03"));
    const run_step_day03 = b.step("run-day03", "Run Day 03 solution");
    run_step_day03.dependOn(&run_day03.step);

    const run_day04 = b.addRunArtifact(day04);
    run_day04.setCwd(b.path("day04"));
    const run_step_day04 = b.step("run-day04", "Run Day 04 solution");
    run_step_day04.dependOn(&run_day04.step);

    const run_day05 = b.addRunArtifact(day05);
    run_day05.setCwd(b.path("day05"));
    const run_step_day05 = b.step("run-day05", "Run Day 05 solution");
    run_step_day05.dependOn(&run_day05.step);
}
