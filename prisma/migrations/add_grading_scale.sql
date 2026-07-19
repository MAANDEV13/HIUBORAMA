CREATE TABLE "GradingScale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" TEXT NOT NULL,
    "minMark" REAL NOT NULL,
    "gpaPoint" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "GradingScale_grade_key" ON "GradingScale"("grade");
