import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Upload, Users, TrendingUp, BarChart3, LogOut, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const NewTeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  
  // Upload form
  const [testTitle, setTestTitle] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDuration, setTestDuration] = useState("60");

  useEffect(() => {
    const currentTeacher = localStorage.getItem("currentTeacher");
    if (!currentTeacher) {
      navigate('/');
      return;
    }
    const teacherData = JSON.parse(currentTeacher);
    setTeacher(teacherData);

    // Load tests created by this teacher
    const allTests = JSON.parse(localStorage.getItem("tests") || "[]");
    const teacherTests = allTests.filter((t: any) => t.teacherId === teacherData.teacherId);
    setTests(teacherTests);

    // Load all test results
    const results = JSON.parse(localStorage.getItem("testResults") || "[]");
    const teacherResults = results.filter((r: any) => 
      teacherTests.some((t: any) => t.testCode === r.testCode)
    );
    setAllResults(teacherResults);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentTeacher");
    localStorage.removeItem("userRole");
    toast({ title: "Logged out", description: "See you next time!" });
    navigate('/');
  };

  const generateTestCode = (subject: string) => {
    const prefix = subject === 'english' ? 'E' : subject === 'science' ? 'S' : 'M';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle || !testSubject) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const testCode = generateTestCode(testSubject);
    const newTest = {
      testCode,
      subject: testSubject,
      title: testTitle,
      durationMinutes: parseInt(testDuration),
      teacherId: teacher.teacherId,
      teacherName: teacher.fullName,
      createdAt: new Date().toISOString()
    };

    const allTests = JSON.parse(localStorage.getItem("tests") || "[]");
    allTests.push(newTest);
    localStorage.setItem("tests", JSON.stringify(allTests));

    toast({ 
      title: "Test Created!", 
      description: `Test code: ${testCode}`,
      duration: 5000
    });

    // Reset form and reload
    setTestTitle("");
    setTestSubject("");
    setTestDuration("60");
    setTests([...tests, newTest]);
  };

  const copyTestCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Test code copied to clipboard" });
  };

  if (!teacher) return null;

  // Analytics calculations
  const avgScore = allResults.length > 0
    ? (allResults.reduce((sum, r) => sum + (r.score || 0), 0) / allResults.length).toFixed(1)
    : 0;

  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const studentCount = new Set(allResults.map(r => r.studentId)).size;

  const genderPerformance = Object.entries(
    allResults.reduce((acc: any, r) => {
      const student = students.find((s: any) => s.studentId === r.studentId);
      const gender = student?.gender || 'Unknown';
      if (!acc[gender]) acc[gender] = { total: 0, count: 0 };
      acc[gender].total += r.score || 0;
      acc[gender].count += 1;
      return acc;
    }, {})
  ).map(([gender, data]: [string, any]) => ({
    gender,
    avgScore: parseFloat((data.total / data.count).toFixed(1))
  }));

  const classPerformance = Object.entries(
    allResults.reduce((acc: any, r) => {
      const student = students.find((s: any) => s.studentId === r.studentId);
      const className = student ? `${student.grade}-${student.class}` : 'Unknown';
      if (!acc[className]) acc[className] = { total: 0, count: 0 };
      acc[className].total += r.score || 0;
      acc[className].count += 1;
      return acc;
    }, {})
  ).map(([name, data]: [string, any]) => ({
    name,
    avgScore: parseFloat((data.total / data.count).toFixed(1))
  }));

  const performanceTrend = allResults
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-10)
    .map((r, i) => ({
      test: `T${i + 1}`,
      score: r.score || 0
    }));

  const difficultyDistribution = Object.entries(
    allResults.reduce((acc: any, r) => {
      const diff = r.difficultyLevel || 'Unknown';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {teacher.fullName}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <Upload className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Created</p>
                <p className="text-3xl font-bold">{tests.length}</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{studentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-3xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-3xl font-bold">{allResults.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create Test</TabsTrigger>
            <TabsTrigger value="tests">My Tests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Test</h3>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testTitle">Test Title *</Label>
                  <Input
                    id="testTitle"
                    placeholder="e.g., Midterm Assessment"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="input-glassy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={testSubject} onValueChange={setTestSubject}>
                    <SelectTrigger className="input-glassy">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="input-glassy"
                  />
                </div>

                <Button type="submit" className="w-full nav-btn-next">
                  Create Test
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Your Tests</h3>
              <div className="space-y-4">
                {tests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tests created yet</p>
                ) : (
                  tests.map((test, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.subject} • {test.durationMinutes} min • {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-lg font-bold text-primary">{test.testCode}</p>
                          <p className="text-xs text-muted-foreground">Test Code</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTestCode(test.testCode)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Class Performance Trend</h3>
              {performanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="test" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No test data yet</p>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Gender Performance</h3>
                {genderPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={genderPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gender" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No test data yet</p>
                )}
              </Card>

              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Class Performance</h3>
                {classPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={classPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="hsl(var(--secondary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No test data yet</p>
                )}
              </Card>

              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Difficulty Distribution</h3>
                {difficultyDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={difficultyDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {difficultyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No test data yet</p>
                )}
              </Card>

              <Card className="cloud-bubble p-6">
                <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                {allResults.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={allResults.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="studentId" hide />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No test data yet</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Individual Student Performance</h3>
              <div className="space-y-4">
                {allResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No student results yet</p>
                ) : (
                  allResults.map((result, idx) => {
                    const student = students.find((s: any) => s.studentId === result.studentId);
                    return (
                      <div key={idx} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                        <div>
                          <p className="font-medium">{student?.fullName || 'Unknown Student'}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {result.studentId} • Grade {student?.grade}-{student?.class} • {student?.gender} • {result.difficultyLevel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Test: {result.testTitle} • {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{result.score}%</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(result.timeSpent / 60)} min
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewTeacherDashboard;
