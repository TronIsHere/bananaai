import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/app/models/task";
import { getNanoBananaTaskStatus } from "@/lib/services/nanobanana";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // First, try to find the task in our MongoDB (like the actual flow)
    let task = await Task.findOne({ taskId });
    let fromDatabase = false;

    if (task) {
      fromDatabase = true;
      // If task exists in DB and is completed, return that
      if (
        task.status === "completed" &&
        task.images &&
        task.images.length > 0
      ) {
        return NextResponse.json({
          success: true,
          source: "database",
          taskId: task.taskId,
          successFlag: 1,
          imageUrl: task.images[0],
          status: task.status,
          prompt: task.prompt,
          createdAt: task.createdAt,
          completedAt: task.completedAt,
          message: "Found in database (already completed)",
        });
      }
    }

    // Fetch latest status from NanoBanana API (like the actual flow does)
    const remoteStatus = await getNanoBananaTaskStatus(taskId);

    // Extract data from the wrapped response structure
    const statusData = remoteStatus.data;

    if (!statusData) {
      return NextResponse.json(
        { error: "No data in response", response: remoteStatus },
        { status: 500 }
      );
    }

    // If we found a task in DB, update it with the latest status
    if (task) {
      if (statusData.successFlag === 1 && statusData.response?.resultImageUrl) {
        task.status = "completed";
        task.images = [statusData.response.resultImageUrl];
        task.completedAt = new Date();
        await task.save();
      } else if (statusData.successFlag === 2 || statusData.successFlag === 3) {
        task.status = "failed";
        task.error = statusData.errorMessage || "Task failed";
        task.completedAt = new Date();
        await task.save();
      }
    }

    return NextResponse.json({
      success: true,
      source: fromDatabase ? "database_and_api" : "api_only",
      taskId: statusData.taskId,
      successFlag: statusData.successFlag,
      imageUrl: statusData.response?.resultImageUrl || null,
      errorMessage: statusData.errorMessage || null,
      createTime: statusData.createTime,
      completeTime: statusData.completeTime,
      databaseTask: task
        ? {
            exists: true,
            status: task.status,
            creditsDeducted: task.creditsDeducted,
          }
        : { exists: false },
      fullResponse: remoteStatus, // Include full response for debugging
    });
  } catch (error: any) {
    console.error("Test task status error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch task status",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
