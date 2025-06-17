import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: PostsListComponent,
  },
  {
    path: 'post/:id',
    component: PostDetailComponent,
  },
];
