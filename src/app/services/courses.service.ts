import { map, shareReplay, filter, share } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Course } from '../model/course';
import { Lesson } from '../model/lesson';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  constructor(private http: HttpClient) {

  }

  loadCourseById(courseId: number) {
    return this.http.get<Course>(`/api/courses/${courseId}`)
      .pipe(shareReplay())
  }

  loadAllCourseLessons(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>('/api/lessons', {
      params: {
        pageSie: "10000",
        course: courseId.toString()
      }
    }).pipe(
      map(res => res["payload"]),
      shareReplay()
    )
  }

  loadedAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>("/api/courses")
      .pipe(
        map(res => res["payload"]),
        shareReplay()
      );
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {
    return this.http.put(`/api/courses/${courseId}`, changes)
      .pipe(
        shareReplay()
      );
  }

  searchLessons(search: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>('/api/lessons', {
      params: {
        filter: search,
        pageSie: "100"
      }
    }).pipe(
      map(res => res["payload"]),
      shareReplay()
    )
  }
}
