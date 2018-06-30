import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatRadioButton } from '@angular/material';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { User } from '../../common/models/user';
import { Role } from '../../common/models/role';
import { UserService } from '../../common/services/user.service';
import { GroupService } from '../../common/services/group.service';
import { DialogsService } from '../../components/dialogs/dialogs.service';
import { AlertWindowsComponent } from '../../components/alert-windows/alert-windows.component';

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.css']
})
export class AddUsersComponent implements OnInit {

  constructor(private userService: UserService,
    private alertwindow: AlertWindowsComponent,
    private dialogsService: DialogsService) { }

    displayedColumns = ['FirstName', 'LastName', 'Role', 'Blocked','Check'];
    roles: Role[];
    users: User[];
    name: string;
    surname: string;
    role: string;
    state: boolean;
    newState: boolean;
    id: number;
    forMessage: string;
    selectedType: Role;
    selectedState: boolean;
    roleName: string = null;
    public result: any;
    dataSource = new MatTableDataSource<User>(this.users);
    private searchTerms = new Subject<string>();
  
    getType(roleName: string, type: Role): string {
      this.selectedType = type;
      this.selectedState = null;
      return this.roleName = roleName;
    }
  
  
    // choose specific user
    chooseUser(id: number, role: string, name: string, surname: string, state: boolean) {
      this.surname = surname;
      this.name = name;
      this.state = state;
      this.id = id;
    }
  
    // filter by state
    getUsersByState(state: boolean) {
      this.selectedState = state;
      this.selectedType = null;
      this.userService.getUserByState(state).subscribe(user => this.users = user);
    }
  
    // search by role
    search(term: string, roleName: string): void {
      this.searchTerms.next(term);
    }
  
    getRole(role: string) {
      return this.role = role;
    }
  
    // changeState:blocked and active
    changeState(id: number, state: boolean, newState) {
      if (this.id == null || state == null) {
        this.alertwindow.openSnackBar('Choose user!', 'Ok'); // window.alert('Choose user');
        return false;
      }
      if (newState) {
        this.forMessage = ' block ';
      }
      if (!newState) {
        this.forMessage = ' unblock ';
      }
      if (this.state === newState) {
        this.alertwindow.openSnackBar('User ' + this.name + ' ' + this.surname + ' already' + this.forMessage, 'Ok');
        return false;
      }
      const user = { Blocked: newState, Id: this.id };
      this.dialogsService
        .confirm('Confirm Dialog', 'Are sure you want to ' + this.forMessage + ' user : ' + this.name + ' ' + this.surname + '  ?')
        .subscribe(res => {
          this.result = res;
  
          if (this.result) {
            this.userService.updateUser(user as User).subscribe();
            this.users.forEach(element => {
              if (element.Id === id) {
                element.Blocked = newState;
              }
            });
            this.state = newState;
            return true;
          }
        });
    }
  
    // change role for user
    updateRole(id: number, role: string, name: string, surname: string) {
      if (role == null || id == null) {
        this.alertwindow.openSnackBar('Choose role!', 'Ok');
        return false;
      }
      this.dialogsService
        .confirm('Confirm Dialog', 'Are sure you want to update role for user  ' + name + ' ' + surname + ' on role "' + role + '" ?')
        .subscribe(res => {
          this.result = res;
          if (this.result) {
            const user = { Role: role, Id: id };
            this.userService.updateUser(user as User).subscribe();
            this.users.forEach(element => {
              if (element.Id === id) {
                element.Role = role;
              }
            });
          }
        });
    }
  
    // filtering by role
    getByRole(id: number) {
      if (id === -1) {
        this.userService.getUsers().subscribe(user => this.users = user);
        return true;
      }
      this.userService.getUserByRole_id(id).subscribe(user => this.users = user);
  
    }
  
    ngOnInit() {
      debugger
      this.userService.getRoles().subscribe(
        role => this.roles = role);
      this.userService.getUsers().subscribe(
        user => this.users = user
      );
      this.searchTerms.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => this.userService.search(term, this.roleName))
      ).subscribe(user => this.users = user);
    }

}
