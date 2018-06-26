import { Component, OnInit, Input, Inject } from '@angular/core';
import { Plan } from '../../common/models/plan';
import { PlanService } from '../../common/services/plan.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task } from '../../common/models/task';
import { TaskService } from '../../common/services/task.service';

@Component({
  selector: 'app-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.css']
})
export class PlanEditorComponent implements OnInit {
  tasksInPlan: Task[];
  tasksNotInPlan: Task[];
  @Input()
  plan: Plan;
  constructor(public dialogRef: MatDialogRef<PlanEditorComponent>,
    private planService: PlanService, private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: Plan) { this.plan = data; }

  ngOnInit() {
    this.taskService.getTasks(this.plan.Id).subscribe(data => {
      this.tasksInPlan = data;
      this.taskService.getTasks().subscribe(allTasks => {
        this.tasksInPlan.forEach(task => this.deleteFromArrey(task, allTasks));
        this.tasksNotInPlan = allTasks;
      });
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onTaskChange(tasksInPlan: boolean, task: Task) {
    if (tasksInPlan) {
      this.tasksNotInPlan.push(task);
      this.deleteFromArrey(task, this.tasksInPlan);
    } else {
      this.tasksInPlan.push(task);
      this.deleteFromArrey(task, this.tasksNotInPlan);
    }
  }
  deleteFromArrey(task: Task, tasks: Task[]) {
    let index = -1;
    tasks.forEach(element => {
      if (element.Id === task.Id) {
        ++index;
        tasks.splice(index, 1);
        return;
      }
      ++index;
    });
  }
  onSaveClick(name: string, description: string) {
    this.plan.Name = name;
    this.plan.Description = description;
    this.planService.updatePlan(this.plan);
    // todo: add tasks to plan
  }
}
