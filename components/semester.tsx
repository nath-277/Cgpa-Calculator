"use client"

import { useState } from "react"
import { type Course, type SemesterData} from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { gradePoints } from "../lib/gradePoints"

interface SemesterProps {
  semester: SemesterData
  updateCourses: (courses: Course[]) => void
  onDelete: () => void
}

export default function Semester({ semester, updateCourses, onDelete }: SemesterProps) {
  const [newCourseTitle, setNewCourseTitle] = useState("")

  // Add a new course to the semester
  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: newCourseTitle || `Course ${semester.courses.length + 1}`,
      grade: "",
      unit: 0,
    }

    updateCourses([...semester.courses, newCourse])
    setNewCourseTitle("")
  }

  // Delete a course from the semester
  const deleteCourse = (courseId: string) => {
    updateCourses(semester.courses.filter((course) => course.id !== courseId))
  }

  // Update a course's details
  const updateCourse = (courseId: string, field: keyof Course, value: string | number) => {
    updateCourses(
      semester.courses.map((course) => {
        if (course.id === courseId) {
          return { ...course, [field]: value }
        }
        return course
      }),
    )
  }

  // Clear all courses in the semester
  const clearCourses = () => {
    updateCourses([])
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>{semester.name}</CardTitle>
          <Badge variant="secondary" className="text-lg">
            GPA: {semester.gpa}
          </Badge>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this semester? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Course Title</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semester.courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No courses added yet. Add a course to get started.
                </TableCell>
              </TableRow>
            ) : (
              semester.courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <Input
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                      placeholder="Course Title"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={course.grade} onValueChange={(value) => updateCourse(course.id, "grade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(gradePoints).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade} ({gradePoints[grade]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={course.unit || ""}
                      onChange={(e) => updateCourse(course.id, "unit", Number.parseInt(e.target.value) || 0)}
                      placeholder="Units"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCourse(course.id)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete course</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="New Course Title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCourse()
                }
              }}
            />
            <Button onClick={addCourse} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
          {semester.courses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Courses</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all courses from this semester? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCourses}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

