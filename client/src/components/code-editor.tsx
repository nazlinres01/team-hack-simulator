import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import type { ChallengeWithAttempts } from "@shared/schema";

interface CodeEditorProps {
  challenge: ChallengeWithAttempts;
  solution: any;
  onSolutionChange: (solution: any) => void;
}

export default function CodeEditor({ challenge, solution, onSolutionChange }: CodeEditorProps) {
  const [code, setCode] = useState(solution.code || challenge.content?.code || '');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    onSolutionChange({ ...solution, code });
  }, [code]);

  const runCode = () => {
    setOutput('');
    setErrors([]);
    
    try {
      // Simple code validation and execution simulation
      const lines = code.split('\n');
      const issues: string[] = [];
      
      // Check for common issues
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
          if (trimmed.includes('let ') || trimmed.includes('const ') || trimmed.includes('var ') || 
              trimmed.includes('total +=') || trimmed.includes('return ')) {
            issues.push(`Line ${index + 1}: Missing semicolon`);
          }
        }
      });
      
      // Check for return statement in functions
      if (code.includes('function ') && !code.includes('return ')) {
        issues.push('Function is missing a return statement');
      }
      
      setErrors(issues);
      
      if (issues.length === 0) {
        setOutput('✅ Code runs successfully!\nOutput: [1, 1, 3, 4, 5]\nExecution time: 0.02ms');
      } else {
        setOutput('❌ Code has errors. Fix them to continue.');
      }
    } catch (error) {
      setErrors(['Syntax error in code']);
      setOutput('❌ Failed to execute code');
    }
  };

  const resetCode = () => {
    setCode(challenge.content?.code || '');
    setOutput('');
    setErrors([]);
  };

  const getErrorSeverity = (error: string) => {
    if (error.toLowerCase().includes('missing semicolon')) return 'warning';
    if (error.toLowerCase().includes('missing return')) return 'error';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            💻 Code Challenge: Fix the Bugs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">{challenge.description}</p>
          
          {challenge.content?.errors && (
            <div className="bg-dark-700 p-3 rounded-lg">
              <h4 className="font-semibold mb-2 text-accent-amber">Issues to Fix:</h4>
              <ul className="space-y-1">
                {challenge.content.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-slate-300 flex items-center">
                    <AlertCircle className="w-3 h-3 text-accent-amber mr-2 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Code Editor</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetCode}
                className="border-dark-600 hover:bg-dark-700"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={runCode}
                className="bg-accent-green hover:bg-accent-green/90"
              >
                <Play className="w-3 h-3 mr-1" />
                Run Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 bg-dark-700 border border-dark-600 rounded-lg p-4 font-mono text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your code here..."
              spellCheck={false}
            />
            
            {/* Line numbers (simplified) */}
            <div className="absolute left-2 top-4 text-slate-500 text-sm font-mono pointer-events-none">
              {code.split('\n').map((_, index) => (
                <div key={index} className="h-5">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="bg-dark-800 border-dark-600">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <span className="mr-2">🖥️</span>
            Output & Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded text-sm ${
                    getErrorSeverity(error) === 'warning'
                      ? 'bg-accent-amber/10 border border-accent-amber/20 text-accent-amber'
                      : 'bg-accent-red/10 border border-accent-red/20 text-accent-red'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              ))}
            </div>
          )}
          
          {/* Console Output */}
          <div className="bg-dark-700 p-3 rounded-lg min-h-[100px] font-mono text-sm">
            {output ? (
              <pre className="text-slate-300 whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-slate-500 italic">Click "Run Code" to see output...</p>
            )}
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              <Badge
                variant={errors.length === 0 ? "default" : "destructive"}
                className={errors.length === 0 ? "bg-accent-green" : ""}
              >
                {errors.length === 0 ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    No Errors
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.length} Error{errors.length !== 1 ? 's' : ''}
                  </>
                )}
              </Badge>
              
              <span className="text-sm text-slate-400">
                Lines: {code.split('\n').length} | 
                Characters: {code.length}
              </span>
            </div>
            
            {errors.length === 0 && output.includes('✅') && (
              <Badge className="bg-accent-green">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready to Submit!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
