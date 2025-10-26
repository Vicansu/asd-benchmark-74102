import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BookOpen, TrendingUp, Award, LogOut, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewStudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [testCode, setTestCode] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    const currentStudent = localStorage.getItem("currentStudent");
    if (!currentStudent) {
      navigate('/');
      return;
    }
    const studentData = JSON.parse(currentStudent);
    setStudent(studentData);

    // Load test results for this student
    const results = JSON.parse(localStorage.getItem("testResults") || "[]");
    const studentResults = results.filter((r: any) => r.studentId === studentData.studentId);
    setTestResults(studentResults);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("userRole");
    toast({ title: "Logged out", description: "See you next time!" });
    navigate('/');
  };

  const handleEnterTestCode = () => {
    if (!testCode.trim()) {
      toast({ title: "Error", description: "Please enter a test code", variant: "destructive" });
      return;
    }

    // Validate test code format (1 letter + 5 characters)
    if (testCode.length !== 6) {
      toast({ title: "Error", description: "Test code must be 6 characters", variant: "destructive" });
      return;
    }

    const tests = JSON.parse(localStorage.getItem("tests") || "[]");
    const test = tests.find((t: any) => t.testCode === testCode.toUpperCase());

    if (!test) {
      toast({ title: "Error", description: "Invalid test code", variant: "destructive" });
      return;
    }

    // Check if already taken
    const hasAlreadyTaken = testResults.some(r => r.testCode === testCode.toUpperCase());
    if (hasAlreadyTaken) {
      toast({ title: "Already Taken", description: "You have already completed this test", variant: "destructive" });
      return;
    }

    // Store test info and navigate to assessment
    localStorage.setItem('currentTest', JSON.stringify(test));
    localStorage.setItem("studentData", JSON.stringify(student));
    navigate('/assessment');
  };

  if (!student) return null;

  const avgScore = testResults.length > 0 
    ? (testResults.reduce((sum, r) => sum + (r.score || 0), 0) / testResults.length).toFixed(1)
    : 0;

  const scoreData = testResults.slice(0, 10).reverse().map((r, i) => ({
    name: `Test ${i + 1}`,
    score: r.score || 0
  }));

  const subjectData = Object.entries(
    testResults.reduce((acc: any, r) => {
      const subject = r.subject || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const difficultyData = Object.entries(
    testResults.reduce((acc: any, r) => {
      const diff = r.difficultyLevel || 'Unknown';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {student.fullName}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Test Code Entry */}
        <Card className="cloud-bubble p-6 mb-8">
          <div className="flex items-center gap-4">
            <Code className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Enter Test Code</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 6-letter code (e.g., E1A2B3)"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                  className="input-glassy uppercase"
                  maxLength={6}
                />
                <Button onClick={handleEnterTestCode} className="nav-btn-next">
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tests Taken</p>
                <p className="text-3xl font-bold">{testResults.length}</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{avgScore}%</p>
              </div>
            </div>
          </Card>

          <Card className="cloud-bubble p-6">
            <div className="flex items-center gap-4">
              <Award className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Subjects</p>
                <p className="text-2xl font-bold">All Subjects</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Score Trend</h3>
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
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
                <h3 className="text-lg font-semibold mb-4">Tests by Subject</h3>
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectData.map((entry, index) => (
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
                <h3 className="text-lg font-semibold mb-4">Difficulty Levels</h3>
                {difficultyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={difficultyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No test data yet</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
              <div className="space-y-4">
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tests taken yet</p>
                ) : (
                  testResults.map((result, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <div>
                        <p className="font-medium">{result.testTitle || 'Test'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(result.completedAt).toLocaleDateString()} • {result.difficultyLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{result.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(result.timeSpent / 60)} min
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="cloud-bubble p-6">
              <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
              <div className="space-y-3">
                <div><span className="font-medium">Student ID:</span> {student.studentId}</div>
                <div><span className="font-medium">Name:</span> {student.fullName}</div>
                <div><span className="font-medium">Grade:</span> {student.grade}</div>
                <div><span className="font-medium">Class:</span> {student.class}</div>
                <div><span className="font-medium">Gender:</span> {student.gender}</div>
                <div><span className="font-medium">Age:</span> {student.age}</div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NewStudentDashboard;
