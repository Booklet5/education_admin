<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="query.keyWord" placeholder="考试名称/学员姓名" clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-select clearable filterable @change="changeSubject" v-model="query.gradeInfoId" placeholder="请选择年级">
          <el-option
            v-for="item in gradeInfoList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-select
          v-if="query.gradeInfoId"
          clearable filterable
          v-model="query.subjectId"
          placeholder="请选择科目">
          <el-option
            v-for="item in subjectList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          v-if="hasPermission(['system:exam:list'])"
          @click="searchExamInfo"
          icon="el-icon-search" type="primary">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="examInfoList"
      border
      v-loading="loading"
      style="width: 100%;">

      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>

      <el-table-column
        prop="studentName"
        align="center"
        width="120"
        label="学员姓名">
      </el-table-column>

      <el-table-column
        prop="testPaperInfoName"
        align="center"
        min-width="200"
        label="考试名称">
      </el-table-column>

      <el-table-column
        prop="testPaperInfoMark"
        align="center"
        width="80"
        label="总分">
      </el-table-column>

      <el-table-column
        prop="mark"
        align="center"
        label="成绩">
      </el-table-column>

      <el-table-column
        align="center"
        label="年级">
        <template slot-scope="scope">
          <el-tag size="small">{{scope.row.gradeName}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="subjectName"
        align="center"
        label="科目">
      </el-table-column>

      <el-table-column
        prop="examTime"
        align="center"
        label="考试用时">
      </el-table-column>

      <el-table-column
        prop="createDate"
        align="center"
        label="提交时间">
      </el-table-column>

     <el-table-column
        prop="questionNumber"
        align="center"
        width="80"
        label="试题数量">
      </el-table-column>

      <el-table-column
        align="center"
        label="状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.correctFlag === 0" type="danger" size="small">待批改</el-tag>
          <el-tag v-else size="small">已批改</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        min-width="120"
        label="操作">
          <template v-if="hasPermission(['system:exam:correct'])" slot-scope="scope">
            <el-dropdown>
              <span class="el-dropdown-link">
                操作<i class="el-icon-caret-bottom"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-if="scope.row.correctFlag === 0"
                  @click.native="correctStudentExam(scope.row, false)"
                  icon="el-icon-edit">批改</el-dropdown-item>
                <el-dropdown-item
                  v-else
                  @click.native="correctStudentExam(scope.row, true)"
                  icon="el-icon-search">查看详情</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      @size-change="changeSize"
      @current-change="changePage"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :total="totalCount"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
  import {getGradeInfoList} from '@/api/gradeInfo'
  import {getSubjectInfoList} from '@/api/subjectInfo'
  let that = null
  export default {
    name: 'exam',
    data () {
      return {
        query: {
          gradeInfoId: '',
          subjectId: null,
          keyWord: ''
        },
        subjectList: [],
        examInfoList: [],
        loading: true,
        gradeInfoList: [],
        currentPage: 1,
        keyWord: '',
        pageSize: 10,
        totalCount: 0
      }
    },

    beforeCreate () {
      that = this
    },

    watch: {

    },

    mounted () {
      this.getExamInfoList()
      getGradeInfoList({}).then(response => {
        this.gradeInfoList = response.data.data.dataList
      })
    },

    methods: {

      changeSubject (gradeInfoId) {
        let params = {
          gradeInfoId: gradeInfoId
        }
        getSubjectInfoList(params).then(response => {
          this.subjectList = response.data.data.dataList
        })
      },

      correctStudentExam (examInfo, lookQuestionAnswerFlag) {
        let studentMark = examInfo.systemMark
        if (lookQuestionAnswerFlag) {
          studentMark = examInfo.mark
        }
        let studentExamInfo = {
          examInfoId: examInfo.id,
          studentId: examInfo.studentId,
          testPaperInfoId: examInfo.testPaperInfoId,
          testPaperInfoName: examInfo.testPaperInfoName,
          studentMark: studentMark,
          paperMark: examInfo.testPaperInfoMark,
          subjectName: examInfo.subjectName,
          studentName: examInfo.studentName,
          lookQuestionAnswerFlag: lookQuestionAnswerFlag
        }
        this.$store.commit('map/updateStudentExamInfo', studentExamInfo)
        this.$router.push('studentQuestionHistory')
      },

      searchExamInfo () {
        that.currentPage = 1
        that.getExamInfoList()
      },

      lookStudentExam (exam) {
        /* sessionStorage.setItem('paper_name', exam.paper_name)
        this.$router.push({
          name: 'studentExam',
          query: {
            testPaperId: exam.test_paper_info_id,
            paper_mark: exam.paper_mark
          }
        }) */
      },

      changeSize (val) {
        that.pageSize = val
        that.currentPage = 1
        that.getExamInfoList()
      },

      changePage (val) {
        that.currentPage = val
        that.getExamInfoList()
      },

      getExamInfoList () {
        this.axios.get(that.$http.httpUrl('/system/exam'), {
          params: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            testPaperInfoName: this.query.keyWord,
            gradeInfoId: this.query.gradeInfoId,
            subjectId: this.query.subjectId
           // correctFlag: 0
          }
        }).then(response => {
          this.examInfoList = response.data.data.dataList
          this.totalCount = response.data.data.total
          this.loading = false
        })
      }
    },

    filters: {

    }
  }
</script>

<style scoped>

</style>
