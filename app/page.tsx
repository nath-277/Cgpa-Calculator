"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash, Trash2, Edit, Check, X } from "lucide-react"
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
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"
import { Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Define types
export type Course = {
  id: string
  title: string
  grade: string
  unit: number
}

export type SemesterData = {
  id: string
  name: string
  courses: Course[]
  gpa: number
}

// Nigerian 5-point grading system
export const gradePoints: Record<string, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
}

// Get CGPA color based on value
const getCgpaColor = (cgpa: number) => {
  if (cgpa >= 4.5) return "hsl(142, 76%, 36%)" // Success green
  if (cgpa >= 3.5) return "hsl(142, 71%, 45%)" // Lighter green
  if (cgpa >= 2.5) return "hsl(38, 92%, 50%)" // Warning yellow
  if (cgpa >= 1.5) return "hsl(25, 95%, 53%)" // Orange
  return "hsl(0, 84%, 60%)" // Destructive red
}

// Get degree classification based on CGPA
const getDegreeClassification = (cgpa: number) => {
  if (cgpa >= 4.5) return "First Class"
  if (cgpa >= 3.5) return "Second Class Upper"
  if (cgpa >= 2.5) return "Second Class Lower"
  if (cgpa >= 1.5) return "Third Class"
  return "Fail"
}

// Get classification color class
const getClassificationColorClass = (cgpa: number) => {
  if (cgpa >= 4.5) return "bg-green-100 text-green-800"
  if (cgpa >= 3.5) return "bg-green-100 text-green-600"
  if (cgpa >= 2.5) return "bg-yellow-100 text-yellow-800"
  if (cgpa >= 1.5) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}

// Get grade color class
const getGradeColorClass = (grade: string) => {
  const point = gradePoints[grade] || 0
  if (point >= 4.5) return "bg-green-600 text-white"
  if (point >= 3.5) return "bg-green-500 text-white"
  if (point >= 2.5) return "bg-yellow-500 text-white"
  if (point >= 1.5) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
}

// SemiCircleProgressBar Component
function SemiCircleProgressBar({ value, maxValue }: { value: number; maxValue: number }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <CircularProgressbar
        value={value}
        maxValue={maxValue}
        text={`${value.toFixed(2)}`}
        circleRatio={0.75}
        styles={buildStyles({
          rotation: 0.625,
          strokeLinecap: "round",
          textSize: "18px",
          fontWeight: "bold",
          pathTransitionDuration: 0.5,
          pathColor: getCgpaColor(value),
          textColor: "#333",
          trailColor: "#e6e6e6",
        })}
      />
    </div>
  )
}

// GpaChart Component
function GpaChart({ data }: { data?: { semester: string; gpa: number; cgpa: number }[] }) {
  // Ensure data is always an array, even if undefined is passed
  const safeData = data || []

  const defaultChartData = {
    labels: ["No data"],
    datasets: [
      {
        label: "GPA",
        data: [0],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.5)",
      },
      {
        label: "CGPA",
        data: [0],
        borderColor: "hsl(var(--secondary))",
        backgroundColor: "hsl(var(--secondary) / 0.5)",
      },
    ],
  }

  const [chartData, setChartData] = useState<ChartData<"line">>(defaultChartData)

  useEffect(() => {
    // If data is empty, use default chart data
    if (safeData.length === 0) {
      setChartData(defaultChartData)
      return
    }

    // Otherwise, create chart data from the provided data
    try {
      const cgpaValue = safeData.length > 0 ? safeData[safeData.length - 1].cgpa : 0
      const cgpaColor = getCgpaColor(cgpaValue)

      setChartData({
        labels: safeData.map((item) => item.semester),
        datasets: [
          {
            label: "GPA",
            data: safeData.map((item) => item.gpa),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "white",
            pointBorderColor: "rgb(59, 130, 246)",
            pointBorderWidth: 2,
          },
          {
            label: "CGPA",
            data: safeData.map(() => cgpaValue),
            borderColor: cgpaColor,
            backgroundColor: `${cgpaColor}50`,
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 0,
          },
        ],
      })
    } catch (error) {
      console.error("Error creating chart data:", error)
      setChartData(defaultChartData)
    }
  }, [safeData])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "GPA & CGPA Trend",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#333",
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        borderColor: "#ddd",
        borderWidth: 1,
        displayColors: true,
        boxPadding: 5,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value: number) => {
            if (value === 0) return "0"
            if (value === 1) return "E"
            if (value === 2) return "D"
            if (value === 3) return "C"
            if (value === 4) return "B"
            if (value === 5) return "A"
            return value
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  return (
    <div className="h-[300px]">
      {safeData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Add courses to see your GPA trend
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  )
}

// Semester Component
function Semester({
  semester,
  updateCourses,
  onDelete,
  updateSemesterName,
}: {
  semester: SemesterData
  updateCourses: (courses: Course[]) => void
  onDelete: () => void
  updateSemesterName: (name: string) => void
}) {
  const [newCourseTitle, setNewCourseTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(semester.name)

  // Add a new course to the semester
  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: newCourseTitle || `Course ${semester.courses.length + 1}`,
      grade: "A",
      unit: 3,
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

  // Start editing semester title
  const startEditingTitle = () => {
    setIsEditingTitle(true)
    setEditedTitle(semester.name)
  }

  // Save edited semester title
  const saveTitle = () => {
    updateSemesterName(editedTitle)
    setIsEditingTitle(false)
  }

  // Cancel editing semester title
  const cancelEditingTitle = () => {
    setIsEditingTitle(false)
    setEditedTitle(semester.name)
  }

  return (
    <Card className="overflow-hidden border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isEditingTitle ? (
              <div className="flex items-center">
                <Input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="px-2 py-1 rounded text-black h-8"
                  autoFocus
                />
                <Button
                  onClick={saveTitle}
                  variant="ghost"
                  size="icon"
                  className="ml-2 bg-white text-blue-600 hover:bg-blue-50 h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={cancelEditingTitle}
                  variant="ghost"
                  size="icon"
                  className="ml-1 bg-white text-red-600 hover:bg-blue-50 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center">
                <CardTitle className="text-xl font-bold text-white">{semester.name}</CardTitle>
                <Button
                  onClick={startEditingTitle}
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-white opacity-70 hover:opacity-100 hover:bg-transparent h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-4 bg-white text-blue-600 px-3 py-1">
              GPA: {semester.gpa.toFixed(2)}
            </Badge>
            <div className="flex space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="bg-yellow-500 hover:bg-yellow-600 h-8">
                    <Trash2 className="h-4 w-4" />
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8">
                    <Trash2 className="h-4 w-4" />
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[40%]">Course Title</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-center">Unit</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semester.courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No courses added yet. Click the button below to add your first course.
                </TableCell>
              </TableRow>
            ) : (
              semester.courses.map((course) => (
                <TableRow key={course.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell>
                    <Input
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                      placeholder="Course Title"
                      className="w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Select value={course.grade} onValueChange={(value) => updateCourse(course.id, "grade", value)}>
                      <SelectTrigger className={`w-20 mx-auto ${getGradeColorClass(course.grade)}`}>
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
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={course.unit || ""}
                      onChange={(e) => updateCourse(course.id, "unit", Number.parseInt(e.target.value) || 0)}
                      placeholder="Units"
                      className="w-16 p-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {(gradePoints[course.grade] || 0) * (course.unit || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCourse(course.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
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

        <div className="mt-4">
          <Button
            onClick={addCourse}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center transition duration-200"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Course
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CGPACalculator() {
  const [semesters, setSemesters] = useState<SemesterData[]>([])
  const [cgpa, setCgpa] = useState<number>(0)
  const [gpaHistory, setGpaHistory] = useState<{ semester: string; gpa: number; cgpa: number }[]>([])

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("cgpaCalculatorData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setSemesters(parsedData.semesters || [])
        setCgpa(parsedData.cgpa || 0)
        setGpaHistory(parsedData.gpaHistory || [])
      } else {
        // Add first semester if no data exists
        addSemester()
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      // Reset to defaults if there's an error
      setSemesters([])
      setCgpa(0)
      setGpaHistory([])
      addSemester()
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (semesters.length > 0) {
      localStorage.setItem(
        "cgpaCalculatorData",
        JSON.stringify({
          semesters,
          cgpa,
          gpaHistory,
        }),
      )
    }
  }, [semesters, cgpa, gpaHistory])

  // Calculate GPA for a semester
  const calculateGPA = (courses: Course[]): number => {
    if (courses.length === 0) return 0

    let totalWeightedPoints = 0
    let totalUnits = 0

    courses.forEach((course) => {
      if (course.grade && course.unit) {
        const gradePoint = gradePoints[course.grade] || 0
        totalWeightedPoints += gradePoint * course.unit
        totalUnits += course.unit
      }
    })

    return totalUnits > 0 ? Number.parseFloat((totalWeightedPoints / totalUnits).toFixed(2)) : 0
  }

  // Calculate CGPA across all semesters
  const calculateCGPA = (semestersData: SemesterData[]): number => {
    if (semestersData.length === 0) return 0

    let totalWeightedGPA = 0
    let totalUnits = 0

    semestersData.forEach((semester) => {
      const semesterUnits = semester.courses.reduce((sum, course) => sum + (course.unit || 0), 0)
      totalWeightedGPA += semester.gpa * semesterUnits
      totalUnits += semesterUnits
    })

    return totalUnits > 0 ? Number.parseFloat((totalWeightedGPA / totalUnits).toFixed(2)) : 0
  }

  // Get total credit units
  const getTotalUnits = () => {
    return semesters.reduce((total, semester) => {
      return total + semester.courses.reduce((semTotal, course) => semTotal + (course.unit || 0), 0)
    }, 0)
  }

  // Add a new semester
  const addSemester = () => {
    const newSemester: SemesterData = {
      id: Date.now().toString(),
      name: `Semester ${semesters.length + 1}`,
      courses: [],
      gpa: 0,
    }

    setSemesters((prev) => [...prev, newSemester])
  }

  // Delete a semester
  const deleteSemester = (semesterId: string) => {
    setSemesters((prev) => {
      const updatedSemesters = prev.filter((sem) => sem.id !== semesterId)

      // Update CGPA and GPA history
      const newCGPA = calculateCGPA(updatedSemesters)
      setCgpa(newCGPA)

      const newGpaHistory = updatedSemesters.map((sem) => ({
        semester: sem.name,
        gpa: sem.gpa,
        cgpa: newCGPA,
      }))
      setGpaHistory(newGpaHistory)

      return updatedSemesters
    })
  }

  // Update a semester's name
  const updateSemesterName = (semesterId: string, newName: string) => {
    setSemesters((prev) => {
      const updatedSemesters = prev.map((semester) => {
        if (semester.id === semesterId) {
          return {
            ...semester,
            name: newName,
          }
        }
        return semester
      })

      // Update GPA history with new semester names
      const newGpaHistory = updatedSemesters.map((sem) => ({
        semester: sem.name,
        gpa: sem.gpa,
        cgpa,
      }))
      setGpaHistory(newGpaHistory)

      return updatedSemesters
    })
  }

  // Update a semester's courses
  const updateSemesterCourses = (semesterId: string, updatedCourses: Course[]) => {
    setSemesters((prev) => {
      const updatedSemesters = prev.map((semester) => {
        if (semester.id === semesterId) {
          const gpa = calculateGPA(updatedCourses)
          return {
            ...semester,
            courses: updatedCourses,
            gpa,
          }
        }
        return semester
      })

      // Update CGPA
      const newCGPA = calculateCGPA(updatedSemesters)
      setCgpa(newCGPA)

      // Update GPA history
      const newGpaHistory = updatedSemesters.map((sem) => ({
        semester: sem.name,
        gpa: sem.gpa,
        cgpa: newCGPA,
      }))
      setGpaHistory(newGpaHistory)

      return updatedSemesters
    })
  }

  // Add a placeholder semester for testing
  // useEffect(() => {
  //   if (semesters.length === 0) {
  //     addSemester()
  //   }
  // }, [semesters.length])

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Nigerian CGPA Calculator</h1>
          <p className="text-gray-600">Track your academic progress using the Nigerian 5-point grading system</p>
        </div>

        {/* CGPA Summary Card */}
        <Card className="mb-8 border border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="w-full lg:w-1/3 flex flex-col items-center">
                <SemiCircleProgressBar value={cgpa} maxValue={5.0} />
                <div className="text-center mt-2">
                  <div className="font-bold text-xl mb-1">CGPA</div>
                  <div className="text-sm text-gray-500">Based on {getTotalUnits()} Credit Units</div>
                  <div
                    className={`mt-2 px-4 py-1 rounded-full text-sm font-medium inline-block ${getClassificationColorClass(cgpa)}`}
                  >
                    {getDegreeClassification(cgpa)}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-2/3 h-64">
                <GpaChart data={gpaHistory} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Semester Button */}
        <div className="text-center mb-6">
          <Button
            onClick={addSemester}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Semester
          </Button>
        </div>

        {/* Semesters */}
        <div className="space-y-6">
          {semesters.map((semester) => (
            <Semester
              key={semester.id}
              semester={semester}
              updateCourses={(courses) => updateSemesterCourses(semester.id, courses)}
              onDelete={() => deleteSemester(semester.id)}
              updateSemesterName={(name) => updateSemesterName(semester.id, name)}
            />
          ))}
        </div>

        {/* Help section */}
        <Card className="mt-8 mb-8 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800">Nigerian 5-Point Grading System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-bold mb-2">Grades & Points</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>A</span>
                    <span className="font-medium">5 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>B</span>
                    <span className="font-medium">4 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>C</span>
                    <span className="font-medium">3 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>D</span>
                    <span className="font-medium">2 points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>E</span>
                    <span className="font-medium">1 point</span>
                  </li>
                  <li className="flex justify-between">
                    <span>F</span>
                    <span className="font-medium">0 points</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-bold mb-2">Class of Degree</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>First Class</span>
                    <span className="font-medium">4.50 - 5.00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Second Upper</span>
                    <span className="font-medium">3.50 - 4.49</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Second Lower</span>
                    <span className="font-medium">2.50 - 3.49</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Third Class</span>
                    <span className="font-medium">1.50 - 2.49</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fail</span>
                    <span className="font-medium">0.00 - 1.49</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-bold mb-2">How CGPA is Calculated</h3>
                <ol className="list-decimal ml-4 space-y-1 text-sm">
                  <li>Multiply each course's grade point by its unit weight</li>
                  <li>Sum all weighted grade points for a semester</li>
                  <li>Divide by the total units to get semester GPA</li>
                  <li>Calculate CGPA as weighted average of all semester GPAs</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 mb-4">
          <p>Nigerian CGPA Calculator © {new Date().getFullYear()}</p>
          <p className="mt-1">Data is saved locally in your browser</p>
        </div>
      </div>
    </div>
  )
}

