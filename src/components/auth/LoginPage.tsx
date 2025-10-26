import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(true);
  const [studentForm, setStudentForm] = useState({
    studentId: "", password: "", fullName: "", grade: "", class: "", gender: "", age: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    teacherId: "", password: "", fullName: "", subject: ""
  });

  const handleStudentAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Sign up validation
      if (!studentForm.studentId || !studentForm.password || !studentForm.fullName || 
          !studentForm.grade || !studentForm.class || !studentForm.gender || !studentForm.age) {
        toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
        return;
      }
      
      // Store student data
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      if (students.find((s: any) => s.studentId === studentForm.studentId)) {
        toast({ title: "Error", description: "Student ID already exists", variant: "destructive" });
        return;
      }
      
      students.push(studentForm);
      localStorage.setItem("students", JSON.stringify(students));
      toast({ title: "Success!", description: "Account created! Please login." });
      setIsSignUp(false);
    } else {
      // Login validation
      if (!studentForm.studentId || !studentForm.password) {
        toast({ title: "Missing Information", description: "Please enter Student ID and password", variant: "destructive" });
        return;
      }
      
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const student = students.find((s: any) => s.studentId === studentForm.studentId && s.password === studentForm.password);
      
      if (!student) {
        toast({ title: "Error", description: "Invalid Student ID or password", variant: "destructive" });
        return;
      }
      
      localStorage.setItem("currentStudent", JSON.stringify(student));
      localStorage.setItem("userRole", "student");
      toast({ title: "Welcome!", description: `Logged in as ${student.fullName}` });
      navigate("/student/dashboard");
    }
  };

  const handleTeacherAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Sign up validation with admin password
      if (!teacherForm.teacherId || !teacherForm.password || !teacherForm.fullName || !teacherForm.subject) {
        toast({ title: "Missing Information", description: "Please fill in all fields", variant: "destructive" });
        return;
      }
      
      if (teacherForm.password !== "Amb@ssador#Bench!") {
        toast({ title: "Invalid Admin Password", description: "Please check your password", variant: "destructive" });
        return;
      }
      
      // Store teacher data
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      if (teachers.find((t: any) => t.teacherId === teacherForm.teacherId)) {
        toast({ title: "Error", description: "Teacher ID already exists", variant: "destructive" });
        return;
      }
      
      teachers.push(teacherForm);
      localStorage.setItem("teachers", JSON.stringify(teachers));
      toast({ title: "Success!", description: "Account created! Please login." });
      setIsSignUp(false);
    } else {
      // Login validation
      if (!teacherForm.teacherId || !teacherForm.password) {
        toast({ title: "Missing Information", description: "Please enter Teacher ID and password", variant: "destructive" });
        return;
      }
      
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: any) => t.teacherId === teacherForm.teacherId && t.password === teacherForm.password);
      
      if (!teacher) {
        toast({ title: "Error", description: "Invalid Teacher ID or password", variant: "destructive" });
        return;
      }
      
      localStorage.setItem("currentTeacher", JSON.stringify(teacher));
      localStorage.setItem("userRole", "teacher");
      toast({ title: "Welcome!", description: `Logged in as ${teacher.fullName}` });
      navigate("/teacher/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl cloud-bubble p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">ASD Benchmark Assessment</h1>
          <p className="text-muted-foreground">Professional PISA-Style Assessment Platform</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <div className="mb-4 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleStudentAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID *</Label>
                <Input 
                  id="student-id" 
                  placeholder="Enter student ID" 
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">Password *</Label>
                <Input 
                  id="student-password" 
                  type="password" 
                  placeholder="Enter password" 
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Enter full name" 
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Input 
                      id="grade" 
                      placeholder="e.g., 10" 
                      value={studentForm.grade}
                      onChange={(e) => setStudentForm({...studentForm, grade: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Input 
                      id="class" 
                      placeholder="e.g., A" 
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({...studentForm, class: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Input 
                      id="gender" 
                      placeholder="e.g., Male, Female, Other" 
                      value={studentForm.gender}
                      onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="Enter age" 
                      value={studentForm.age}
                      onChange={(e) => setStudentForm({...studentForm, age: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <div className="mb-4 flex gap-2 justify-center">
              <Button 
                variant={isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
              <Button 
                variant={!isSignUp ? "default" : "outline"} 
                onClick={() => setIsSignUp(false)}
                className="flex-1"
              >
                Login
              </Button>
            </div>

            <form onSubmit={handleTeacherAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-id">Teacher ID *</Label>
                <Input 
                  id="teacher-id" 
                  placeholder="Enter teacher ID" 
                  value={teacherForm.teacherId}
                  onChange={(e) => setTeacherForm({...teacherForm, teacherId: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher-password">{isSignUp ? "Admin Password" : "Password"} *</Label>
                <Input 
                  id="teacher-password" 
                  type="password" 
                  placeholder={isSignUp ? "Enter admin password: Amb@ssador#Bench!" : "Enter password"} 
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} 
                  className="input-glassy" 
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Full Name *</Label>
                    <Input 
                      id="teacher-name" 
                      placeholder="Enter your name" 
                      value={teacherForm.fullName}
                      onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})} 
                      className="input-glassy" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={teacherForm.subject} onValueChange={(value) => setTeacherForm({...teacherForm, subject: value})}>
                      <SelectTrigger className="input-glassy"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full nav-btn-next mt-6">
                {isSignUp ? "Sign Up" : "Login to Dashboard"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
