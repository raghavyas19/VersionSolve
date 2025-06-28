import { LanguageConfig } from '../types';

export const LANGUAGES: Record<string, LanguageConfig> = {
  cpp: {
    name: 'C++',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
    compileCommand: 'g++ -o solution solution.cpp',
    runCommand: './solution'
  },
  java: {
    name: 'Java',
    extension: 'java',
    monacoLanguage: 'java',
    template: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        
    }
}`,
    compileCommand: 'javac Solution.java',
    runCommand: 'java Solution'
  },
  python: {
    name: 'Python',
    extension: 'py',
    monacoLanguage: 'python',
    template: `# Write your code here

def main():
    pass

if __name__ == "__main__":
    main()`,
    runCommand: 'python solution.py'
  },
  c: {
    name: 'C',
    extension: 'c',
    monacoLanguage: 'c',
    template: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your code here
    
    return 0;
}`,
    compileCommand: 'gcc -o solution solution.c',
    runCommand: './solution'
  }
};

export const VERDICT_COLORS = {
  'Accepted': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  'Wrong Answer': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  'Time Limit Exceeded': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  'Memory Limit Exceeded': 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  'Runtime Error': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  'Compilation Error': 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
  'Pending': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
};

export const DIFFICULTY_COLORS = {
  'Easy': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  'Medium': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
  'Hard': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
};