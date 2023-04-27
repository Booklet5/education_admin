<template>
    <div>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span style="font-weight: bold;">{{testPaperInfo.name}}考试成绩分析</span>
          <!--<el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>-->
        </div>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="grid-content bg-purple">考试名称：{{testPaperInfo.name}}</div>
          </el-col>
          <el-col :span="5"><div class="grid-content bg-purple">科目: {{testPaperInfo.subjectName}}</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">总分: {{testPaperInfo.mark}}分</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">考试时间: {{resultData.examTime}}</div></el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="grid-content bg-purple">参考人数：{{resultData.examNumber}}人</div>
          </el-col>
          <el-col :span="5"><div class="grid-content bg-purple">平均分: {{resultData.avgExamMark}}分</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">及格分: {{resultData.passExamMark}}分</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">优秀分: {{resultData.niceExamMark}}分</div></el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="grid-content bg-purple">最高分：{{resultData.maxExamMark}}分</div>
          </el-col>
          <el-col :span="5"><div class="grid-content bg-purple">及格人数: {{resultData.passExamNumber}}人</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">优秀人数: {{resultData.niceExamNumber}}人</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">及格率: {{resultData.passRateStr}}</div></el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8"><div class="grid-content bg-purple">最低分: {{resultData.minExamMark}}分</div></el-col>
          <el-col :span="5"><div class="grid-content bg-purple">平均用时: {{resultData.avgExamTimeStr}}</div></el-col>
        </el-row>
      </el-card>

      <el-divider>成绩排名</el-divider>

      <vxe-table
        border
        :data="examRakingList">
        <vxe-table-column align="center" type="seq" title="排名" width="60"></vxe-table-column>
        <vxe-table-column align="center" field="studentName" title="姓名"></vxe-table-column>
        <vxe-table-column align="center" field="sex" title="性别"></vxe-table-column>
        <vxe-table-column align="center" field="examTime" sortable title="用时"></vxe-table-column>
        <vxe-table-column align="center" field="systemMark" sortable title="系统评分"></vxe-table-column>
        <vxe-table-column align="center" field="teacherMark" sortable title="教师评分"></vxe-table-column>
        <vxe-table-column align="center" field="mark" sortable title="总得分"></vxe-table-column>
      </vxe-table>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    export default {
      name: 'examReportDetail',
      data () {
        return {
          resultData: null,
          currentPage: 1,
          pageSize: 10,
          totalCount: 0,
          examRakingList: []
        }
      },

      computed: {
        ...mapGetters({
          testPaperInfo: 'map/getTestPaperInfo'
        })
      },

      mounted () {
        this.getExamDetail()
        this.getExamRakingList()
      },

      methods: {
        getExamDetail () {
          this.axios.get(this.$http.httpUrl('/system/exam/getExamDetailReport/' + this.testPaperInfo.id))
            .then(response => {
              this.resultData = response.data.data
            })
        },

        getExamRakingList () {
          this.axios.get(this.$http.httpUrl('/system/exam/getExamRankingList/' + this.testPaperInfo.id), {
            params: {
              pageNumber: this.pageNumber,
              pageSize: this.pageSize
            }
          })
            .then(response => {
              this.examRakingList = response.data.data.dataList
              this.totalCount = response.data.data.total
            })
        }
      }
    }
</script>

<style scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .el-row {
    margin: 10px 15px 10px 30px;
    font-size: 16px;
  }
  .box-card {
  }
</style>
