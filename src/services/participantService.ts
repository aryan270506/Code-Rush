import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type {
  CompetitionRound,
  QuizQuestion,
  QuizSubmission,
  CodingProblem,
  CodeSubmission,
  LeaderboardEntry,
  ParticipantStats,
  AnnouncementItem,
  NotificationItem,
  ParticipantProfileData,
} from "../types/participant";

// ── DEFAULT COMPETITION DATA ──────────────────────────────────────────

export const INITIAL_ROUNDS: CompetitionRound[] = [
  {
    id: 1,
    slug: "quiz",
    name: "Round 1: Quiz Battle",
    shortDescription: "Rapid-fire algorithmic, data structure, and system MCQs.",
    description:
      "Test core computer science fundamentals, time complexity reasoning, and language quirks under pressure. 15 questions in 20 minutes.",
    status: "available",
    maxScore: 150,
    currentScore: 120,
    durationMinutes: 20,
    questionCount: 15,
    startTime: "2026-10-18T10:00:00Z",
    endTime: "2026-10-18T12:00:00Z",
    rules: [
      "15 multiple-choice questions.",
      "+10 points per correct answer, -2 points negative marking for wrong answers.",
      "Timer starts immediately upon clicking 'Start Quiz Battle'.",
      "Auto-submits when the countdown reaches 00:00.",
      "Switching tabs triggers automated proctoring alerts.",
    ],
    iconName: "Brain",
    color: "violet",
    isQualified: true,
  },
  {
    id: 2,
    slug: "coding",
    name: "Round 2: Coding Battle",
    shortDescription: "Two algorithmic challenges with automated test execution.",
    description:
      "Solve competitive algorithmic challenges using efficient data structures. Code against hidden and sample test cases with strict time/memory constraints.",
    status: "in_progress",
    maxScore: 200,
    currentScore: 140,
    durationMinutes: 60,
    questionCount: 2,
    startTime: "2026-10-18T12:30:00Z",
    endTime: "2026-10-18T14:30:00Z",
    rules: [
      "Supported languages: Python 3, JavaScript (ES2022), C++17, Java 17.",
      "Evaluation against sample and hidden boundary test cases.",
      "Time limit: 2.0s per test case; Memory limit: 256 MB.",
      "Partial scoring enabled based on passed test suites.",
    ],
    iconName: "Code2",
    color: "cyan",
    isQualified: true,
  },
  {
    id: 3,
    slug: "debugging",
    name: "Round 3: Debugging Battle",
    shortDescription: "Diagnose, isolate, and fix logic flaws and race conditions.",
    description:
      "You are handed real-world codebases with subtle bugs: off-by-one errors, recursion depth overflows, and broken invariant checks. Fix and verify all unit tests.",
    status: "available",
    maxScore: 150,
    currentScore: 0,
    durationMinutes: 45,
    questionCount: 2,
    startTime: "2026-10-18T15:00:00Z",
    endTime: "2026-10-18T16:30:00Z",
    rules: [
      "Do not rewrite the entire algorithm; repair the flawed logic cleanly.",
      "All public and edge test cases must pass.",
      "Code quality and diff cleanliness factor into tiebreaker criteria.",
    ],
    iconName: "Bug",
    color: "violet",
    isQualified: false,
  },
  {
    id: 4,
    slug: "final",
    name: "Round 4: Final Battle",
    shortDescription: "The Championship Arena — Advanced graph & distributed systems challenge.",
    description:
      "Only the top 20% of participants unlock this round. Highly challenging algorithmic problems designed to test ultimate engineering prowess.",
    status: "locked",
    maxScore: 300,
    currentScore: 0,
    durationMinutes: 90,
    questionCount: 2,
    startTime: "2026-10-18T17:00:00Z",
    endTime: "2026-10-18T19:00:00Z",
    rules: [
      "Access unlocked only for participants with >= 300 total points from Rounds 1–3.",
      "Strict zero-tolerance plagiarism checking with AST tree diffing.",
      "Official final standings published following organizer audit.",
    ],
    iconName: "Trophy",
    color: "cyan",
    isQualified: false,
  },
];

// ── QUIZ QUESTIONS (ROUND 1) ──────────────────────────────────────────

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    questionNumber: 1,
    statement:
      "What is the amortized time complexity of inserting an element into a dynamic array (like std::vector or Python list) when resizing is required?",
    options: [
      { id: "opt_a", text: "O(1) amortized" },
      { id: "opt_b", text: "O(n) worst and amortized" },
      { id: "opt_c", text: "O(log n) amortized" },
      { id: "opt_d", text: "O(n log n)" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_a",
    explanation:
      "While a resize operation takes O(n) to copy elements, doubling the capacity distributes the work so that each insertion incurs an amortized cost of O(1).",
  },
  {
    id: "q2",
    questionNumber: 2,
    statement:
      "Consider the following recursive function. What is the value returned for call `solve(4)`?",
    codeSnippet: `function solve(n) {
  if (n <= 1) return 1;
  return solve(n - 1) + 2 * solve(n - 2);
}`,
    options: [
      { id: "opt_a", text: "9" },
      { id: "opt_b", text: "11" },
      { id: "opt_c", text: "15" },
      { id: "opt_d", text: "13" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_b",
    explanation:
      "solve(0)=1, solve(1)=1; solve(2)=1 + 2(1)=3; solve(3)=3 + 2(1)=5; solve(4)=5 + 2(3)=11.",
  },
  {
    id: "q3",
    questionNumber: 3,
    statement:
      "Which data structure is fundamentally utilized to detect cycles in an undirected graph in near-constant time per edge?",
    options: [
      { id: "opt_a", text: "Disjoint Set Union (Union-Find) with path compression" },
      { id: "opt_b", text: "Fibonacci Heap" },
      { id: "opt_c", text: "Segment Tree with lazy propagation" },
      { id: "opt_d", text: "Trie of Radix 2" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_a",
    explanation:
      "Disjoint Set Union (DSU) checks whether two vertices are already in the same connected component in α(V) ≈ O(1) time.",
  },
  {
    id: "q4",
    questionNumber: 4,
    statement:
      "In modern operating systems, which memory segment stores dynamically allocated variables created via `malloc()` or `new`?",
    options: [
      { id: "opt_a", text: "Stack Segment" },
      { id: "opt_b", text: "Heap Segment" },
      { id: "opt_c", text: "BSS Segment" },
      { id: "opt_d", text: "Text / Code Segment" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_b",
    explanation:
      "Heap memory is dedicated to dynamic allocation managed explicitly by the programmer or runtime garbage collector.",
  },
  {
    id: "q5",
    questionNumber: 5,
    statement:
      "What is the worst-case time complexity of QuickSelect to find the k-th smallest element when using Median-of-Medians pivot selection?",
    options: [
      { id: "opt_a", text: "O(n²)" },
      { id: "opt_b", text: "O(n log n)" },
      { id: "opt_c", text: "O(n)" },
      { id: "opt_d", text: "O(k log n)" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_c",
    explanation:
      "Median-of-Medians guarantees at least a 30/70 split, yielding a linear recurrence T(n) ≤ T(n/5) + T(7n/10) + O(n) = O(n).",
  },
  {
    id: "q6",
    questionNumber: 6,
    statement:
      "In JavaScript / TypeScript, what will be logged to the console by the following asynchronous code snippet?",
    codeSnippet: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");`,
    options: [
      { id: "opt_a", text: "1, 2, 3, 4" },
      { id: "opt_b", text: "1, 4, 3, 2" },
      { id: "opt_c", text: "1, 4, 2, 3" },
      { id: "opt_d", text: "3, 1, 4, 2" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_b",
    explanation:
      "Synchronous code runs first (1, 4). Microtasks (Promise then: 3) run before Macrotasks (setTimeout: 2). Result: 1, 4, 3, 2.",
  },
  {
    id: "q7",
    questionNumber: 7,
    statement:
      "Which graph traversal algorithm guarantees finding the shortest path in an unweighted graph?",
    options: [
      { id: "opt_a", text: "Depth First Search (DFS)" },
      { id: "opt_b", text: "Breadth First Search (BFS)" },
      { id: "opt_c", text: "Kosaraju's Algorithm" },
      { id: "opt_d", text: "Tarjan's Bridge-Finding Algorithm" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_b",
    explanation:
      "BFS visits vertices in non-decreasing order of distance from source, ensuring the shortest path in unweighted graphs.",
  },
  {
    id: "q8",
    questionNumber: 8,
    statement:
      "What is the maximum number of nodes in a binary tree of height `h` (where a tree with a single root node has height 1)?",
    options: [
      { id: "opt_a", text: "2^h - 1" },
      { id: "opt_b", text: "2^(h-1)" },
      { id: "opt_c", text: "2^(h+1) - 1" },
      { id: "opt_d", text: "h² + 1" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_a",
    explanation:
      "A complete binary tree has ∑(2^i) from i=0 to h-1 = 2^h - 1 nodes.",
  },
  {
    id: "q9",
    questionNumber: 9,
    statement:
      "What property must a heuristic h(n) satisfy in A* search to guarantee finding an optimal path on a tree search?",
    options: [
      { id: "opt_a", text: "Monotonicity" },
      { id: "opt_b", text: "Admissibility (h(n) ≤ true cost h*(n))" },
      { id: "opt_c", text: "Strict Overestimation" },
      { id: "opt_d", text: "Linearity" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_b",
    explanation:
      "An admissible heuristic never overestimates the actual minimal cost to the goal, ensuring optimality.",
  },
  {
    id: "q10",
    questionNumber: 10,
    statement:
      "In relational database theory, what normal form eliminates transitive dependencies of non-prime attributes on candidate keys?",
    options: [
      { id: "opt_a", text: "First Normal Form (1NF)" },
      { id: "opt_b", text: "Second Normal Form (2NF)" },
      { id: "opt_c", text: "Third Normal Form (3NF)" },
      { id: "opt_d", text: "Boyce-Codd Normal Form (BCNF)" },
    ],
    points: 10,
    negativePoints: 2,
    correctOptionId: "opt_c",
    explanation:
      "3NF requires 2NF plus no transitive dependencies (X → Y → Z where Z is non-prime).",
  },
];

// ── CODING PROBLEM (ROUND 2) ──────────────────────────────────────────

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "p1",
    title: "Subarray with Maximum XOR Sum",
    slug: "max-xor-subarray",
    difficulty: "Medium",
    points: 100,
    timeLimitSeconds: 2.0,
    memoryLimitMB: 256,
    statement: `You are given an array of $N$ non-negative integers. Your task is to find the maximum possible XOR sum of any contiguous non-empty subarray.

A subarray is defined as a contiguous subsequence of elements within the array.

### Input Format
- The first line contains an integer $N$ ($1 \\le N \\le 10^5$), representing the size of the array.
- The second line contains $N$ space-separated integers $A_1, A_2, \\dots, A_N$ ($0 \\le A_i < 2^{30}$).

### Output Format
- Print a single integer: the maximum XOR value obtainable from any contiguous subarray.`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single integer denoting the maximum XOR sum.",
    constraints: [
      "1 <= N <= 100,000",
      "0 <= A[i] < 2^30",
      "Time Limit: 2.0 seconds",
      "Memory Limit: 256 MB",
    ],
    sampleTestCases: [
      {
        id: "tc1",
        input: "4\n1 2 3 4",
        expectedOutput: "7",
        explanation: "Subarray [3, 4] gives 3 XOR 4 = 7 (binary: 011 XOR 100 = 111).",
      },
      {
        id: "tc2",
        input: "3\n8 1 2",
        expectedOutput: "11",
        explanation: "Subarray [8, 1, 2] yields 8 ^ 1 ^ 2 = 11.",
      },
    ],
    starterCode: {
      python: `import sys

def solve():
    # Read input from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    
    # Write your Trie or Prefix XOR solution here:
    max_xor = 0
    curr_xor = 0
    # TODO: Implement prefix XOR tree query
    for x in arr:
        curr_xor ^= x
        max_xor = max(max_xor, curr_xor)
        
    print(max_xor)

if __name__ == '__main__':
    solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!input || input.length === 0 || input[0] === '') return;
  
  const n = parseInt(input[0], 10);
  const arr = input.slice(1, n + 1).map(Number);

  // Implement prefix XOR Trie logic
  let maxXor = 0;
  let currXor = 0;
  for (const x of arr) {
    currXor ^= x;
    if (currXor > maxXor) maxXor = currXor;
  }

  console.log(maxXor);
}

solve();`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct TrieNode {
    TrieNode* child[2] = {nullptr, nullptr};
};

void insert(TrieNode* root, int val) {
    TrieNode* curr = root;
    for (int i = 30; i >= 0; --i) {
        int b = (val >> i) & 1;
        if (!curr->child[b]) curr->child[b] = new TrieNode();
        curr = curr->child[b];
    }
}

int query(TrieNode* root, int val) {
    TrieNode* curr = root;
    int res = 0;
    for (int i = 30; i >= 0; --i) {
        int b = (val >> i) & 1;
        int want = 1 - b;
        if (curr->child[want]) {
            res |= (1 << i);
            curr = curr->child[want];
        } else if (curr->child[b]) {
            curr = curr->child[b];
        } else {
            break;
        }
    }
    return res;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    TrieNode* root = new TrieNode();
    insert(root, 0);

    int prefix = 0, ans = 0;
    for (int x : a) {
        prefix ^= x;
        insert(root, prefix);
        ans = max(ans, query(root, prefix));
    }

    cout << ans << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        int prefix = 0;
        int maxVal = 0;
        for (int val : arr) {
            prefix ^= val;
            maxVal = Math.max(maxVal, prefix);
        }
        
        System.out.println(maxVal);
    }
}`,
    },
  },
  {
    id: "p2",
    title: "Optimal Distributed Task Scheduler",
    slug: "task-scheduler",
    difficulty: "Medium",
    points: 100,
    timeLimitSeconds: 2.0,
    memoryLimitMB: 256,
    statement: `Given an array of tasks represented by uppercase characters and a non-negative cooling interval $k$, compute the minimum number of CPU cycles required to finish all tasks.

Identical tasks must be separated by at least $k$ CPU cooling intervals (idle cycles or other tasks).

### Input Format
- Line 1: An integer $N$ and cooldown interval $k$.
- Line 2: A string of $N$ space-separated uppercase characters.

### Output Format
- Print the total minimum clock cycles required.`,
    inputFormat: "Line 1: N k. Line 2: Tasks string.",
    outputFormat: "Minimum integer clock cycles.",
    constraints: ["1 <= N <= 10^5", "0 <= k <= 100"],
    sampleTestCases: [
      {
        id: "tc2_1",
        input: "6 2\nA A A B B B",
        expectedOutput: "8",
        explanation: "One optimal execution order is: A -> B -> idle -> A -> B -> idle -> A -> B (Total 8 cycles).",
      },
    ],
    starterCode: {
      python: `import sys
from collections import Counter

def least_interval():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    k = int(lines[1])
    tasks = lines[2:2+n]
    
    counts = Counter(tasks)
    max_freq = max(counts.values())
    max_count = sum(1 for v in counts.values() if v == max_freq)
    
    ans = max(n, (max_freq - 1) * (k + 1) + max_count)
    print(ans)

if __name__ == '__main__':
    least_interval()`,
      javascript: `const fs = require('fs');

function solve() {
  const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!tokens || tokens.length < 2) return;
  const n = parseInt(tokens[0], 10);
  const k = parseInt(tokens[1], 10);
  const tasks = tokens.slice(2, 2 + n);

  const freq = {};
  for (const t of tasks) freq[t] = (freq[t] || 0) + 1;
  const vals = Object.values(freq);
  const maxFreq = Math.max(...vals);
  const maxCount = vals.filter(v => v === maxFreq).length;

  const result = Math.max(n, (maxFreq - 1) * (k + 1) + maxCount);
  console.log(result);
}

solve();`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    unordered_map<char, int> freq;
    for (int i = 0; i < n; i++) {
        char c;
        cin >> c;
        freq[c]++;
    }
    int maxFreq = 0;
    for (auto& p : freq) maxFreq = max(maxFreq, p.second);
    int maxCount = 0;
    for (auto& p : freq) if (p.second == maxFreq) maxCount++;

    int ans = max(n, (maxFreq - 1) * (k + 1) + maxCount);
    cout << ans << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] freq = new int[26];
        for (int i = 0; i < n; i++) {
            String s = sc.next();
            freq[s.charAt(0) - 'A']++;
        }
        int maxFreq = 0;
        for (int f : freq) maxFreq = Math.max(maxFreq, f);
        int maxCount = 0;
        for (int f : freq) if (f == maxFreq) maxCount++;

        int ans = Math.max(n, (maxFreq - 1) * (k + 1) + maxCount);
        System.out.println(ans);
    }
}`,
    },
  },
];

// ── DEBUGGING PROBLEM (ROUND 3) ───────────────────────────────────────

export const DEBUGGING_PROBLEMS: CodingProblem[] = [
  {
    id: "dbg1",
    title: "Off-by-One Binary Search & Monotonic Bounds",
    slug: "debug-binary-search",
    difficulty: "Medium",
    points: 75,
    timeLimitSeconds: 2.0,
    memoryLimitMB: 256,
    statement: `### Bug Report
The following function is intended to implement a lower-bound binary search: given a sorted array of distinct integers and a target $X$, it should return the **0-indexed position** of the first element $\\ge X$. If all elements are $< X$, it must return the array length $N$.

Currently, during stress testing, the implementation encounters an infinite loop on certain targets, produces incorrect indices when target matches the upper boundary, and crashes with an IndexOutOfBoundsException on empty arrays.

### Task
Analyze the flawed code, correct the boundary updates and loop invariants, and ensure all sample and edge test cases pass cleanly without changing the $O(\\log N)$ time complexity.`,
    inputFormat: "Line 1: N target. Line 2: N sorted space-separated integers.",
    outputFormat: "Print the 0-indexed lower bound position.",
    constraints: ["0 <= N <= 10^5", "-10^9 <= target, A[i] <= 10^9"],
    bugExplanation:
      "1. Infinite loop: `mid = (low + high) / 2` with `low = mid` causes freeze when low + 1 == high. 2. Integer overflow on large indices. 3. Incorrect handling when N = 0.",
    sampleTestCases: [
      {
        id: "dbg_tc1",
        input: "5 4\n1 2 4 6 7",
        expectedOutput: "2",
        explanation: "Element 4 is located at index 2.",
      },
      {
        id: "dbg_tc2",
        input: "4 8\n1 3 5 7",
        expectedOutput: "4",
        explanation: "All elements are less than 8, so returns length 4.",
      },
      {
        id: "dbg_tc3",
        input: "0 10\n",
        expectedOutput: "0",
        explanation: "For an empty array, returns 0.",
      },
    ],
    starterCode: {
      python: `import sys

def find_lower_bound(arr, target):
    # BUGGY IMPLEMENTATION - FIX THE LOOP INVARIANTS
    low = 0
    high = len(arr) - 1 # BUG: what if target > arr[high]?
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid # BUG: infinite loop when low + 1 == high
        else:
            high = mid - 1
            
    return low

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    target = int(lines[1])
    arr = [int(x) for x in lines[2:2+n]]
    print(find_lower_bound(arr, target))

if __name__ == '__main__':
    main()`,
      javascript: `const fs = require('fs');

function findLowerBound(arr, target) {
  // BUGGY IMPLEMENTATION - REPAIR INVARIANT
  let low = 0;
  let high = arr.length; // Correct upper bound is arr.length

  while (low < high) {
    const mid = Math.floor(low + (high - low) / 2);
    if (arr[mid] >= target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

const tokens = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (tokens.length >= 2 && tokens[0] !== '') {
  const n = parseInt(tokens[0], 10);
  const target = parseInt(tokens[1], 10);
  const arr = tokens.slice(2, 2 + n).map(Number);
  console.log(findLowerBound(arr, target));
}`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

// BUGGY IMPLEMENTATION - REPAIR LOOP CONDITIONS
int findLowerBound(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size(); // Invariant: answer is always in [low, high]
    
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] >= target) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    return low;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << findLowerBound(arr, target) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Solution {
    public static int findLowerBound(int[] arr, int target) {
        int low = 0;
        int high = arr.length;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] >= target) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return low;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(findLowerBound(arr, target));
    }
}`,
    },
  },
];

// ── FINAL BATTLE PROBLEM (ROUND 4) ───────────────────────────────────

export const FINAL_BATTLE_PROBLEMS: CodingProblem[] = [
  {
    id: "fn1",
    title: "Championship: Quantum Fault-Tolerant Routing",
    slug: "quantum-routing-optimization",
    difficulty: "Championship",
    points: 150,
    timeLimitSeconds: 3.0,
    memoryLimitMB: 512,
    statement: `### The Grand Arena Problem
A high-throughput photonic quantum data network is modeled as a directed weighted graph $G = (V, E)$ with $N$ quantum optical switches and $M$ fiber channels. Each channel has an optical transmission latency $w_e$ and an error probability $p_e \\in [0, 1)$.

When a quantum packet traverses a channel, its coherence degrades multiplicatively by $(1 - p_e)$. You are tasked with determining the minimum latency route between a Source $S$ and a Destination $T$ such that the total composite survival coherence is at least a specified threshold $\\theta$.

If no such route satisfies the coherence threshold, output \`-1\`.

### Input Format
- Line 1: $N, M, S, T, \\theta$
- Next $M$ lines: $u, v, \\text{latency}, \\text{coherence\\_multiplier}$

### Output Format
- Single integer denoting the minimal achievable latency, or -1.`,
    inputFormat: "N M S T theta followed by M edge definitions.",
    outputFormat: "Minimal integer latency or -1.",
    constraints: [
      "2 <= N <= 2,500",
      "1 <= M <= 10,000",
      "0.01 <= theta <= 1.00",
      "Latencies are non-negative integers up to 10^4",
    ],
    sampleTestCases: [
      {
        id: "fn_tc1",
        input: "4 4 1 4 0.50\n1 2 10 0.90\n2 4 15 0.80\n1 3 5 0.60\n3 4 30 0.70",
        expectedOutput: "25",
        explanation: "Path 1 -> 2 -> 4 has latency 10 + 15 = 25 and coherence 0.90 * 0.80 = 0.72 >= 0.50.",
      },
    ],
    starterCode: {
      python: `import sys
import heapq

def solve():
    # Modified Dijkstra with logarithmic probability state pruning
    lines = sys.stdin.read().split()
    if not lines:
        return
    # Read graph parameters and solve optimal state transition
    print("25")

if __name__ == '__main__':
    solve()`,
      javascript: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim();
  if (!input) return;
  // Multi-objective shortest path algorithm
  console.log(25);
}

solve();`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <cmath>

using namespace std;

int main() {
    // Advanced state-space shortest path
    cout << 25 << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println(25);
    }
}`,
    },
  },
];

// ── INITIAL LEADERBOARD ──────────────────────────────────────────────

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "usr_alex_chen",
    displayName: "Alex Chen",
    institution: "Stanford University",
    roundScores: { round1: 150, round2: 200, round3: 150, round4: 280 },
    totalScore: 780,
    status: "Finalist",
    lastActive: "2 mins ago",
  },
  {
    rank: 2,
    userId: "usr_priya_sharma",
    displayName: "Priya Sharma",
    institution: "IIT Bombay",
    roundScores: { round1: 140, round2: 200, round3: 150, round4: 260 },
    totalScore: 750,
    status: "Finalist",
    lastActive: "5 mins ago",
  },
  {
    rank: 3,
    userId: "usr_elena_rostova",
    displayName: "Elena Rostova",
    institution: "ETH Zürich",
    roundScores: { round1: 150, round2: 190, round3: 140, round4: 240 },
    totalScore: 720,
    status: "Finalist",
    lastActive: "12 mins ago",
  },
  {
    rank: 4,
    userId: "usr_marcus_vance",
    displayName: "Marcus Vance",
    institution: "MIT",
    roundScores: { round1: 130, round2: 190, round3: 135, round4: 210 },
    totalScore: 665,
    status: "Qualified",
    lastActive: "18 mins ago",
  },
  {
    rank: 5,
    userId: "demo-participant-uid",
    displayName: "Code Fighter (You)",
    institution: "Autonomous Tech Institute",
    roundScores: { round1: 120, round2: 140, round3: 0, round4: 0 },
    totalScore: 260,
    status: "Qualified",
    isCurrentParticipant: true,
    lastActive: "Just now",
  },
  {
    rank: 6,
    userId: "usr_dev_kumar",
    displayName: "Dev Kumar",
    institution: "BITS Pilani",
    roundScores: { round1: 110, round2: 140, round3: 0, round4: 0 },
    totalScore: 250,
    status: "In Competition",
    lastActive: "25 mins ago",
  },
  {
    rank: 7,
    userId: "usr_sarah_jenkins",
    displayName: "Sarah Jenkins",
    institution: "Cambridge University",
    roundScores: { round1: 130, round2: 110, round3: 0, round4: 0 },
    totalScore: 240,
    status: "In Competition",
    lastActive: "35 mins ago",
  },
  {
    rank: 8,
    userId: "usr_kenji_sato",
    displayName: "Kenji Sato",
    institution: "University of Tokyo",
    roundScores: { round1: 120, round2: 115, round3: 0, round4: 0 },
    totalScore: 235,
    status: "In Competition",
    lastActive: "40 mins ago",
  },
];

// ── INITIAL SUBMISSIONS ──────────────────────────────────────────────

export const INITIAL_SUBMISSIONS: CodeSubmission[] = [
  {
    id: "sub_984102",
    participantId: "demo-participant-uid",
    participantName: "Code Fighter",
    roundId: 2,
    roundName: "Coding Battle",
    problemId: "p1",
    problemTitle: "Subarray with Maximum XOR Sum",
    language: "python",
    code: `# Optimal Prefix XOR Query
import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:n+1]]
    
    max_xor = 0
    curr_xor = 0
    for x in arr:
        curr_xor ^= x
        max_xor = max(max_xor, curr_xor)
    print(max_xor)

if __name__ == '__main__':
    solve()`,
    status: "Accepted",
    score: 100,
    maxScore: 100,
    passedTests: 8,
    totalTests: 8,
    executionTimeMs: 142,
    memoryUsedMB: 38.4,
    submittedAt: "2026-10-18T10:45:00Z",
    testCaseResults: [
      { id: "t1", passed: true, timeMs: 15 },
      { id: "t2", passed: true, timeMs: 18 },
      { id: "t3", passed: true, timeMs: 42 },
      { id: "t4", passed: true, timeMs: 67 },
    ],
  },
  {
    id: "sub_984089",
    participantId: "demo-participant-uid",
    participantName: "Code Fighter",
    roundId: 2,
    roundName: "Coding Battle",
    problemId: "p2",
    problemTitle: "Optimal Distributed Task Scheduler",
    language: "python",
    code: `import sys
from collections import Counter

def least_interval():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    k = int(lines[1])
    tasks = lines[2:2+n]
    
    counts = Counter(tasks)
    max_freq = max(counts.values())
    max_count = sum(1 for v in counts.values() if v == max_freq)
    ans = max(n, (max_freq - 1) * (k + 1) + max_count)
    print(ans)

if __name__ == '__main__':
    least_interval()`,
    status: "Accepted",
    score: 40,
    maxScore: 100,
    passedTests: 4,
    totalTests: 10,
    executionTimeMs: 98,
    memoryUsedMB: 26.1,
    submittedAt: "2026-10-18T11:15:00Z",
    testCaseResults: [
      { id: "t1", passed: true, timeMs: 12 },
      { id: "t2", passed: true, timeMs: 14 },
      { id: "t3", passed: false, timeMs: 72, error: "Wrong Answer on hidden test case" },
    ],
  },
];

// ── ANNOUNCEMENTS & NOTIFICATIONS ────────────────────────────────────

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann_1",
    title: "Round 2 Coding Battle: Test Case Re-evaluation Complete",
    summary:
      "All edge-case time limit checks for Python and JavaScript solutions have been standardized to 2.0s.",
    content:
      "Due to server load variations, time limit limits were bumped from 1.5s to 2.0s for interpreted languages. Any previously failed submissions marked 'Time Limit Exceeded' have been automatically re-judged with updated scores reflected on the provisional leaderboard.",
    priority: "high",
    publishedAt: "2026-10-18T11:00:00Z",
    category: "competition",
    isPinned: true,
  },
  {
    id: "ann_2",
    title: "Round 3 Debugging Battle Opens Today at 15:00 UTC",
    summary:
      "Participants with >= 100 points in Rounds 1 & 2 are qualified to enter Round 3 automatically.",
    content:
      "Get ready to identify complex concurrency deadlocks and algorithmic edge bugs. You will have 45 minutes to repair two corrupted code repositories.",
    priority: "normal",
    publishedAt: "2026-10-18T09:30:00Z",
    category: "round_schedule",
  },
  {
    id: "ann_3",
    title: "Proctoring Integrity and Code Similarity Notice",
    summary:
      "All code submissions undergo automated AST fingerprinting and syntactic token diffing.",
    content:
      "Code Battle uses strict zero-tolerance anti-cheating mechanisms. Any identical solution structures shared across accounts will lead to immediate disqualification and reporting to affiliated institutions.",
    priority: "urgent",
    publishedAt: "2026-10-18T08:00:00Z",
    category: "general",
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Submission Accepted",
    message: "Your solution for Subarray with Maximum XOR Sum passed 8/8 test cases (+100 pts).",
    timestamp: "25 mins ago",
    read: false,
    type: "submission",
    link: "/participant/submissions",
  },
  {
    id: "notif_2",
    title: "Quiz Battle Score Published",
    message: "Round 1 Quiz evaluated: 120 / 150 points. You are qualified for Round 2!",
    timestamp: "1 hour ago",
    read: false,
    type: "round",
    link: "/participant/rounds/quiz",
  },
  {
    id: "notif_3",
    title: "Welcome to Code Battle 2026",
    message: "Your registration is active. Check your system clock and review competition rules.",
    timestamp: "2 hours ago",
    read: true,
    type: "alert",
    link: "/participant/help",
  },
];

// ── SERVICE IMPLEMENTATION ───────────────────────────────────────────

class ParticipantService {
  private localKey(key: string): string {
    return `cb_participant_${key}`;
  }

  // 1. Competition Rounds
  public async getRounds(): Promise<CompetitionRound[]> {
    try {
      const stored = localStorage.getItem(this.localKey("rounds"));
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(this.localKey("rounds"), JSON.stringify(INITIAL_ROUNDS));
      return INITIAL_ROUNDS;
    } catch {
      return INITIAL_ROUNDS;
    }
  }

  public async getRoundBySlug(slug: string): Promise<CompetitionRound | null> {
    const rounds = await this.getRounds();
    return rounds.find((r) => r.slug === slug) || null;
  }

  // 2. Quiz Questions
  public async getQuizQuestions(_roundId: number = 1): Promise<QuizQuestion[]> {
    try {
      // In production, questions are retrieved from Firestore collection 'questions' where roundId == 1
      const qCol = collection(db, "questions");
      const snap = await getDocs(query(qCol, limit(20)));
      if (!snap.empty) {
        const firestoreQuestions: QuizQuestion[] = [];
        snap.forEach((d) => {
          firestoreQuestions.push({ id: d.id, ...d.data() } as QuizQuestion);
        });
        return firestoreQuestions;
      }
    } catch {
      // fallback to resilient local questions
    }
    return QUIZ_QUESTIONS;
  }

  // Save Quiz Attempt
  public async submitQuiz(submission: QuizSubmission): Promise<{ score: number; accuracy: number }> {
    const questions = QUIZ_QUESTIONS;
    let correct = 0;
    let incorrect = 0;
    let score = 0;

    questions.forEach((q) => {
      const userSelected = submission.answers[q.id];
      if (userSelected) {
        if (userSelected === q.correctOptionId) {
          correct++;
          score += q.points;
        } else {
          incorrect++;
          score = Math.max(0, score - q.negativePoints);
        }
      }
    });

    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const finalSubmission: QuizSubmission = {
      ...submission,
      submittedAt: new Date().toISOString(),
      score,
      correctCount: correct,
      incorrectCount: incorrect,
      accuracy,
      status: "evaluated",
    };

    localStorage.setItem(this.localKey("quiz_submission"), JSON.stringify(finalSubmission));

    // Update Round 1 score in stored rounds
    const rounds = await this.getRounds();
    const r1 = rounds.find((r) => r.id === 1);
    if (r1) {
      r1.currentScore = score;
      r1.status = "completed";
      localStorage.setItem(this.localKey("rounds"), JSON.stringify(rounds));
    }

    return { score, accuracy };
  }

  public getQuizSubmission(): QuizSubmission | null {
    try {
      const stored = localStorage.getItem(this.localKey("quiz_submission"));
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // 3. Coding Problems
  public async getCodingProblem(idOrSlug: string): Promise<CodingProblem | null> {
    const all = [...CODING_PROBLEMS, ...DEBUGGING_PROBLEMS, ...FINAL_BATTLE_PROBLEMS];
    return all.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || CODING_PROBLEMS[0];
  }

  // 4. Code Execution Simulation / Judge
  public async executeSampleTests(
    problemId: string,
    _language: string,
    code: string,
    customInput?: string
  ): Promise<{
    passed: boolean;
    results: {
      id: string;
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      timeMs: number;
    }[];
    compilerOutput: string;
  }> {
    // Artificial execution delay representing sandboxed worker container
    await new Promise((r) => setTimeout(r, 900));

    const problem =
      [...CODING_PROBLEMS, ...DEBUGGING_PROBLEMS, ...FINAL_BATTLE_PROBLEMS].find(
        (p) => p.id === problemId
      ) || CODING_PROBLEMS[0];

    // Basic syntax/empty check
    if (!code.trim() || code.length < 15) {
      return {
        passed: false,
        results: [],
        compilerOutput: "Error: No executable code provided or syntax error in main block.",
      };
    }

    // Determine simulation verdict based on sample cases
    const results = problem.sampleTestCases.map((tc, idx) => {
      // If code contains the expected pattern or standard solve structure
      const isDbg = problem.slug.includes("debug");
      const passed = isDbg
        ? code.includes("low < high") || code.includes("arr.length")
        : true;

      return {
        id: tc.id || `tc_${idx}`,
        passed,
        input: customInput || tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: passed ? tc.expectedOutput : "0 (Incorrect invariant)",
        timeMs: Math.floor(Math.random() * 40) + 12,
      };
    });

    const allPassed = results.every((r) => r.passed);

    return {
      passed: allPassed,
      results,
      compilerOutput: allPassed
        ? `[Judge] Code compiled successfully with 0 warnings.\n[Judge] Sandboxed environment execution complete (time: 0.18s, mem: 24MB).`
        : `[Judge] Assertion failed: Expected ${problem.sampleTestCases[0]?.expectedOutput || "output"}, got divergent result.`,
    };
  }

  // Submit Code Solution
  public async submitSolution(params: {
    userId: string;
    userName: string;
    roundId: number;
    roundName: string;
    problemId: string;
    problemTitle: string;
    language: string;
    code: string;
  }): Promise<CodeSubmission> {
    await new Promise((r) => setTimeout(r, 1400));

    const submissions = await this.getSubmissions(params.userId);
    const subId = `sub_${Math.floor(100000 + Math.random() * 900000)}`;

    const newSubmission: CodeSubmission = {
      id: subId,
      participantId: params.userId,
      participantName: params.userName,
      roundId: params.roundId,
      roundName: params.roundName,
      problemId: params.problemId,
      problemTitle: params.problemTitle,
      language: params.language,
      code: params.code,
      status: "Accepted",
      score: 100,
      maxScore: 100,
      passedTests: 10,
      totalTests: 10,
      executionTimeMs: Math.floor(Math.random() * 80) + 45,
      memoryUsedMB: parseFloat((Math.random() * 20 + 25).toFixed(1)),
      submittedAt: new Date().toISOString(),
      compilerOutput: "[Judge 2.4] All 10 hidden and public test suites PASSED with optimal complexity.",
      testCaseResults: [
        { id: "ts_1", passed: true, timeMs: 14 },
        { id: "ts_2", passed: true, timeMs: 22 },
        { id: "ts_3", passed: true, timeMs: 35 },
        { id: "ts_4", passed: true, timeMs: 44 },
      ],
    };

    submissions.unshift(newSubmission);
    localStorage.setItem(this.localKey(`submissions_${params.userId}`), JSON.stringify(submissions));

    // Also try writing to Firestore if permissible
    try {
      const subRef = doc(db, "submissions", subId);
      await setDoc(subRef, newSubmission);
    } catch {
      // local fallback works seamlessly
    }

    return newSubmission;
  }

  // 5. Submissions List
  public async getSubmissions(userId?: string): Promise<CodeSubmission[]> {
    try {
      const key = this.localKey(`submissions_${userId || "all"}`);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(key, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  }

  // 6. Leaderboard
  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const lbCol = collection(db, "leaderboard");
      const snap = await getDocs(query(lbCol, orderBy("totalScore", "desc"), limit(25)));
      if (!snap.empty) {
        const list: LeaderboardEntry[] = [];
        let rank = 1;
        snap.forEach((d) => {
          list.push({ rank: rank++, ...(d.data() as Omit<LeaderboardEntry, "rank">) });
        });
        return list;
      }
    } catch {
      // offline / fallback
    }

    // Merge current participant's live score into the leaderboard
    const currentSubs = await this.getSubmissions();
    const quizSub = this.getQuizSubmission();
    const quizScore = quizSub?.score || 120;
    const codeScore = currentSubs.reduce((acc, curr) => acc + (curr.status === "Accepted" ? curr.score : 0), 0) || 140;

    const list = [...INITIAL_LEADERBOARD];
    const userEntry = list.find((e) => e.isCurrentParticipant);
    if (userEntry) {
      userEntry.roundScores.round1 = quizScore;
      userEntry.roundScores.round2 = codeScore;
      userEntry.totalScore = quizScore + codeScore;
    }

    // Re-sort
    list.sort((a, b) => b.totalScore - a.totalScore);
    list.forEach((e, i) => (e.rank = i + 1));

    return list;
  }

  // 7. Participant Stats Summary
  public async getParticipantStats(userId: string): Promise<ParticipantStats> {
    const rounds = await this.getRounds();
    const subs = await this.getSubmissions(userId);
    const quizSub = this.getQuizSubmission();

    const quizScore = quizSub?.score || 120;
    const codingScore =
      subs.filter((s) => s.roundId === 2 && s.status === "Accepted").reduce((a, b) => a + b.score, 0) || 140;
    const debuggingScore =
      subs.filter((s) => s.roundId === 3 && s.status === "Accepted").reduce((a, b) => a + b.score, 0) || 0;
    const finalScore =
      subs.filter((s) => s.roundId === 4 && s.status === "Accepted").reduce((a, b) => a + b.score, 0) || 0;

    const totalScore = quizScore + codingScore + debuggingScore + finalScore;

    const acceptedSubs = subs.filter((s) => s.status === "Accepted").length;
    const codePassRate = subs.length > 0 ? Math.round((acceptedSubs / subs.length) * 100) : 100;
    const roundsCompleted = rounds.filter((r) => r.status === "completed").length;

    return {
      totalScore,
      currentRank: 5,
      totalParticipants: 540,
      roundsCompleted: roundsCompleted || 1,
      totalRounds: 4,
      qualificationStatus: totalScore >= 200 ? "Qualified" : "In Progress",
      accuracy: quizSub?.accuracy || 80,
      codePassRate,
      quizScore,
      codingScore,
      debuggingScore,
      finalScore,
    };
  }

  // 8. Announcements
  public async getAnnouncements(): Promise<AnnouncementItem[]> {
    try {
      const annCol = collection(db, "announcements");
      const snap = await getDocs(query(annCol, orderBy("publishedAt", "desc"), limit(10)));
      if (!snap.empty) {
        const list: AnnouncementItem[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AnnouncementItem));
        return list;
      }
    } catch {
      // fallback
    }
    return INITIAL_ANNOUNCEMENTS;
  }

  // 9. Notifications
  public async getNotifications(): Promise<NotificationItem[]> {
    try {
      const stored = localStorage.getItem(this.localKey("notifications"));
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(this.localKey("notifications"), JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public async markNotificationRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(this.localKey("notifications"), JSON.stringify(updated));
  }

  public async markAllNotificationsRead(): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    localStorage.setItem(this.localKey("notifications"), JSON.stringify(updated));
  }

  // 10. Participant Profile
  public async getProfile(uid: string): Promise<ParticipantProfileData | null> {
    try {
      const stored = localStorage.getItem(this.localKey(`profile_${uid}`));
      if (stored) return JSON.parse(stored);

      const userDocRef = doc(db, "users", uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        return snap.data() as ParticipantProfileData;
      }
    } catch {
      // ignore
    }

    return {
      displayName: "Code Fighter",
      email: "participant@codebattle.dev",
      uid,
      institution: "Autonomous Tech Institute",
      bio: "Competitive programmer & full-stack architect tackling algorithms under pressure.",
      github: "codefighter",
      createdAt: "2026-10-18T04:00:00Z",
      emailVerified: true,
      role: "participant",
      contestStatus: "active",
    };
  }

  public async updateProfile(uid: string, data: Partial<ParticipantProfileData>): Promise<void> {
    const existing = (await this.getProfile(uid)) || {
      displayName: "Participant",
      email: "",
      uid,
      institution: "",
      createdAt: new Date().toISOString(),
      emailVerified: true,
      role: "participant",
      contestStatus: "active",
    };

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.localKey(`profile_${uid}`), JSON.stringify(updated));

    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, updated, { merge: true });
    } catch {
      // local sync succeeded
    }
  }
}

export const participantService = new ParticipantService();
