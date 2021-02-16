import { MessagesService } from './../messages/messages.service';
import { LoadingService } from './../loading/loading.service';
import { HttpClient } from '@angular/common/http';
import { filter, map, catchError, tap, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Injectable } from "@angular/core";
import { Course, sortCoursesBySeqNo } from '../model/course';

@Injectable({
  providedIn: "root"
})
export class CoursesStore {

  private subject = new BehaviorSubject<Course[]>([]);

  courses$: Observable<Course[]> = this.subject.asObservable();

  constructor(
    private http: HttpClient,
    private loading: LoadingService,
    private messages: MessagesService
  ) {
    this.loadAllCourses();
  }

  loadAllCourses() {
    const loadCourses$ = this.http.get<Course[]>('/api/courses')
      .pipe(
        map(response => response["payload"]),
        catchError(err => {
          const message = "Could not load course";
          console.log(message, err);
          this.messages.showErrors(message)
          return throwError(err);
        }),
        tap(courses => this.subject.next(courses))
      )

    this.loading.showLoaderUntilCompleted(loadCourses$)
      .subscribe(

      )
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    const courses = this.subject.getValue();

    const index = courses.findIndex(course => course.id === courseId);

    const newCourse: Course = {
      ...courses[index],
      ...changes
    }

    const newCourses: Course[] = courses.slice(0);
    newCourses[index] = newCourse;

    this.subject.next(newCourses);

    return this.http.put(`/api/courses/${courseId}`, changes)
      .pipe(
        catchError(err => {
          const message = "Could not save course";
          console.log(message, err);
          this.messages.showErrors(message)
          return throwError(err);
        }),
        shareReplay()
      )
  }

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map(courses => courses
        .filter(course => course.category === category)
        .sort(sortCoursesBySeqNo)
      )
    )
  }
}
