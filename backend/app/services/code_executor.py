import subprocess
import tempfile
import time
import os
import sys

class CodeExecutor:
    # A set of mock/standard coding questions, their template solutions, and test cases
    CODING_QUESTIONS = {
        "two_sum": {
            "title": "Two Sum",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            "templates": {
                "python": "def two_sum(nums, target):\n    # Write your code here\n    pass\n",
                "javascript": "function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}\n"
            },
            "test_cases": [
                {"input": ([2, 7, 11, 15], 9), "expected": [0, 1]},
                {"input": ([3, 2, 4], 6), "expected": [1, 2]},
                {"input": ([3, 3], 6), "expected": [0, 1]}
            ]
        },
        "valid_parentheses": {
            "title": "Valid Parentheses",
            "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            "templates": {
                "python": "def is_valid(s):\n    # Write your code here\n    pass\n",
                "javascript": "function isValid(s) {\n    // Write your code here\n    return false;\n}\n"
            },
            "test_cases": [
                {"input": "()", "expected": True},
                {"input": "()[]{}", "expected": True},
                {"input": "(]", "expected": False}
            ]
        },
        "reverse_string": {
            "title": "Reverse String",
            "description": "Write a function that reverses a string. The input string is given as an array of characters `s`.",
            "templates": {
                "python": "def reverse_string(s):\n    # Write your code here in-place\n    s.reverse()\n    return s\n",
                "javascript": "function reverseString(s) {\n    // Write your code here\n    s.reverse();\n    return s;\n}\n"
            },
            "test_cases": [
                {"input": ["h","e","l","l","o"], "expected": ["o","l","l","e","h"]},
                {"input": ["H","a","n","n","a","h"], "expected": ["h","a","n","n","a","H"]}
            ]
        }
    }

    @staticmethod
    def run_python_code(user_code: str, test_cases: list, function_name: str) -> dict:
        """Executes python code against test cases in a subprocess."""
        results = []
        all_passed = True
        total_time = 0.0

        for idx, tc in enumerate(test_cases):
            # Create a wrapper code that invokes the user code with the inputs and prints the serialized output
            tc_input = tc["input"]
            tc_expected = tc["expected"]
            
            # Format arguments for the call
            if isinstance(tc_input, tuple):
                args_str = ", ".join(repr(x) for x in tc_input)
            else:
                args_str = repr(tc_input)
                
            wrapper = f"""
{user_code}

import json
try:
    res = {function_name}({args_str})
    print("RESULT:" + json.dumps(res))
except Exception as e:
    print("ERROR:" + str(e))
"""
            with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as f:
                f.write(wrapper)
                temp_filename = f.name

            start_time = time.perf_counter()
            try:
                # Run the script with the current python interpreter
                proc = subprocess.run(
                    [sys.executable, temp_filename],
                    capture_output=True,
                    text=True,
                    timeout=2.0
                )
                exec_time = (time.perf_counter() - start_time) * 1000.0  # in ms
                total_time += exec_time
                
                stdout = proc.stdout
                stderr = proc.stderr
                
                if proc.returncode != 0:
                    results.append({
                        "test_case": idx + 1,
                        "passed": False,
                        "error": stderr or "Execution failed with non-zero exit code."
                    })
                    all_passed = False
                    continue
                
                # Parse output
                output_line = [line for line in stdout.splitlines() if line.startswith("RESULT:") or line.startswith("ERROR:")]
                if not output_line:
                    results.append({
                        "test_case": idx + 1,
                        "passed": False,
                        "error": f"No output returned. Console stdout: {stdout}\nStderr: {stderr}"
                    })
                    all_passed = False
                else:
                    line = output_line[0]
                    if line.startswith("ERROR:"):
                        results.append({
                            "test_case": idx + 1,
                            "passed": False,
                            "error": line[6:]
                        })
                        all_passed = False
                    else:
                        actual_res = json.loads(line[7:])
                        passed = (actual_res == tc_expected)
                        if not passed:
                            all_passed = False
                        results.append({
                            "test_case": idx + 1,
                            "passed": passed,
                            "input": str(tc_input),
                            "expected": str(tc_expected),
                            "actual": str(actual_res),
                            "exec_time_ms": round(exec_time, 2)
                        })
            except subprocess.TimeoutExpired:
                results.append({
                    "test_case": idx + 1,
                    "passed": False,
                    "error": "Time Limit Exceeded (Timeout > 2.0s)"
                })
                all_passed = False
            except Exception as e:
                results.append({
                    "test_case": idx + 1,
                    "passed": False,
                    "error": str(e)
                })
                all_passed = False
            finally:
                if os.path.exists(temp_filename):
                    try:
                        os.remove(temp_filename)
                    except Exception:
                        pass
                        
        return {
            "success": all_passed,
            "total_execution_time_ms": round(total_time, 2),
            "results": results
        }

    @staticmethod
    def run_javascript_code(user_code: str, test_cases: list, function_name: str) -> dict:
        """Executes javascript code using Node.js."""
        results = []
        all_passed = True
        total_time = 0.0

        # Check if node is available
        try:
            subprocess.run(["node", "-v"], capture_output=True)
        except Exception:
            return {
                "success": False,
                "error": "Node.js environment not available on server.",
                "results": []
            }

        for idx, tc in enumerate(test_cases):
            tc_input = tc["input"]
            tc_expected = tc["expected"]
            
            import json
            input_json = json.dumps(tc_input)
            
            # Write a node wrapper script
            # Handle tuple argument destructuring in JS
            if isinstance(tc_input, list) or isinstance(tc_input, tuple):
                if function_name == "twoSum":
                    # For two sum, inputs are (nums, target). input_json is [[2,7,11,15], 9]
                    args_js = f"{json.dumps(tc_input[0])}, {json.dumps(tc_input[1])}"
                else:
                    args_js = json.dumps(tc_input)
            else:
                args_js = json.dumps(tc_input)

            wrapper = f"""
{user_code}

try {{
    const res = {function_name}({args_js});
    console.log("RESULT:" + JSON.stringify(res));
}} catch (e) {{
    console.log("ERROR:" + e.message);
}}
"""
            with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode="w", encoding="utf-8") as f:
                f.write(wrapper)
                temp_filename = f.name

            start_time = time.perf_counter()
            try:
                proc = subprocess.run(
                    ["node", temp_filename],
                    capture_output=True,
                    text=True,
                    timeout=2.0
                )
                exec_time = (time.perf_counter() - start_time) * 1000.0
                total_time += exec_time
                
                stdout = proc.stdout
                stderr = proc.stderr
                
                if proc.returncode != 0:
                    results.append({
                        "test_case": idx + 1,
                        "passed": False,
                        "error": stderr or "Execution failed with non-zero exit code."
                    })
                    all_passed = False
                    continue

                output_line = [line for line in stdout.splitlines() if line.startswith("RESULT:") or line.startswith("ERROR:")]
                if not output_line:
                    results.append({
                        "test_case": idx + 1,
                        "passed": False,
                        "error": f"No output returned. Console stdout: {stdout}\nStderr: {stderr}"
                    })
                    all_passed = False
                else:
                    line = output_line[0]
                    if line.startswith("ERROR:"):
                        results.append({
                            "test_case": idx + 1,
                            "passed": False,
                            "error": line[6:]
                        })
                        all_passed = False
                    else:
                        actual_res = json.loads(line[7:])
                        passed = (actual_res == tc_expected)
                        if not passed:
                            all_passed = False
                        results.append({
                            "test_case": idx + 1,
                            "passed": passed,
                            "input": str(tc_input),
                            "expected": str(tc_expected),
                            "actual": str(actual_res),
                            "exec_time_ms": round(exec_time, 2)
                        })
            except subprocess.TimeoutExpired:
                results.append({
                    "test_case": idx + 1,
                    "passed": False,
                    "error": "Time Limit Exceeded (Timeout > 2.0s)"
                })
                all_passed = False
            except Exception as e:
                results.append({
                    "test_case": idx + 1,
                    "passed": False,
                    "error": str(e)
                })
                all_passed = False
            finally:
                if os.path.exists(temp_filename):
                    try:
                        os.remove(temp_filename)
                    except Exception:
                        pass

        return {
            "success": all_passed,
            "total_execution_time_ms": round(total_time, 2),
            "results": results
        }

    @classmethod
    def execute(cls, question_key: str, language: str, user_code: str) -> dict:
        """Executes the code based on selected language and question metadata."""
        if question_key not in cls.CODING_QUESTIONS:
            return {"success": False, "error": f"Unknown question: {question_key}"}
            
        q_data = cls.CODING_QUESTIONS[question_key]
        
        # Determine function name based on question key
        func_mapping = {
            "two_sum": {"python": "two_sum", "javascript": "twoSum"},
            "valid_parentheses": {"python": "is_valid", "javascript": "isValid"},
            "reverse_string": {"python": "reverse_string", "javascript": "reverseString"},
        }
        
        func_name = func_mapping.get(question_key, {}).get(language)
        if not func_name:
            return {"success": False, "error": f"Language {language} not supported for this question."}
            
        if language == "python":
            return cls.run_python_code(user_code, q_data["test_cases"], func_name)
        elif language == "javascript":
            return cls.run_javascript_code(user_code, q_data["test_cases"], func_name)
        else:
            return {"success": False, "error": f"Unsupported language: {language}"}
