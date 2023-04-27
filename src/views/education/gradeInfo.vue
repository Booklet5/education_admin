<template>
  <div class="mod-user">
    <el-form :model="query" :inline="true" @keyup.enter.native="searchGrade()">
      <el-form-item>
        <el-select
          v-model="query.schoolType"
          filterable
          clearable
          @change="changeSchoolTypeForQuery"
          placeholder="请选择所属阶段">
          <el-option
            v-for="item in schoolTypeList"
            :key="item.id"
            :label="item.value"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-input v-model="query.name" placeholder="输入年级名称" type="text"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="success"
          icon="el-icon-search"
          v-if="hasPermission(['system:grade:list'])"
          @click="searchGrade()">查询</el-button>

        <el-button type="primary" v-if="hasPermission(['system:grade:save'])"  @click="addGrade">新增</el-button>
        <!--<el-button @click="batchDelete" type="danger">批量删除</el-button>-->
      </el-form-item>
    </el-form>
    <el-table
      :data="gradeInfoList"
      border
      @select="checkData"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      style="width: 100%;">

      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>

      <el-table-column
        prop="name"
        align="center"
        label="年级名称">
      </el-table-column>


      <el-table-column
        align="center"
        label="所属阶段">
        <template slot-scope="scope">
          <el-tag size="small">{{scope.row.schoolType | getSchoolTypeName}}</el-tag>
        </template>
      </el-table-column>


      <el-table-column
        prop="createDate"
        align="center"
        width="180"
        label="创建时间">
      </el-table-column>

      <el-table-column
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button
            size="small"
            type="warning"
            v-if="hasPermission(['system:grade:update'])"
            @click="updateGradeInfo(scope.row)">修改</el-button>
          <el-button
            size="small"
            type="danger"
            v-if="hasPermission(['system:grade:deleteById'])"
            @click="deleteGradeInfo(scope.row)"
            >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="!form.id ? '新增年级' : '修改年级'"
      :close-on-click-modal="false"
      :visible.sync="showFlag">

      <el-form :model="form" :rules="rules" ref="form" @keyup.enter.native="saveOrUpdate()" label-width="80px">
        <el-form-item label="年级名称" prop="name">
          <el-input v-model="form.name" placeholder="年级名称"></el-input>
        </el-form-item>

        <el-form-item label="所属阶段" placeholder="所属阶段" prop="schoolType">
          <el-select
            @change="changeSchoolType"
            v-model="form.schoolType"
            filterable
            clearable
            placeholder="请选择">
            <el-option
              v-for="item in schoolTypeList"
              :key="item.id"
              :label="item.value"
              :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

      </el-form>

      <span slot="footer"  class="dialog-footer">
        <el-button @click="showFlag = false">取消</el-button>
        <el-button type="primary" @click="saveOrUpdate()">确定</el-button>
      </span>
    </el-dialog>

    <el-pagination
      background
      @size-change="sizeChangeHandler"
      @current-change="currentChangeHandler"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :total="totalCount"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
  let that = null
  // eslint-disable-next-line import/first
  import {getDictValueByType} from '@/api/dict'
  // eslint-disable-next-line import/first
  import {getGradeInfoList} from '@/api/gradeInfo'
  export default {
    name: 'gradeInfo',
    data () {
      return {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        loading: true,
        showFlag: false,
        schoolTypeList: [],
        gradeInfoList: [],
        form: {
          name: '',
          schoolType: ''
        },
        query: {
          schoolType: '',
          name: ''
        },
        rules: {
          name: [
            {required: true, message: '请输入年级名称', trigger: 'blur'}
          ],
          schoolType: [
            {required: true, message: '请选择所属阶段', trigger: 'blur'}
          ]
        }
      }
    },

    watch: {

    },

    beforeCreate () {
      that = this
    },

    mounted () {
      getDictValueByType('school_type').then(response => {
        this.schoolTypeList = response.data.data
      })
      this.getList()
    },

    methods: {

      getList () {
        let params = {
          pageNumber: this.currentPage,
          pageSize: this.pageSize,
          schoolType: this.query.schoolType,
          name: this.query.name
        }
        getGradeInfoList(params).then(response => {
          this.loading = false
          this.gradeInfoList = response.data.data.dataList
          this.totalCount = response.data.data.total
        })
      },

      searchGrade () {
        this.currentPage = 1
        this.loading = true
        this.getList()
      },

      changeSchoolTypeForQuery (val) {

      },

      // 选中阶段
      changeSchoolType (val) {

      },

      clearFormData () {
        this.form = {
          name: '',
          schoolType: ''
        }
      },

      deleteGradeInfo (gradeInfo) {
        this.$confirm('此操作将删除【' + gradeInfo.name + '】在系统中的所有数据,删除后不可恢复,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete(that.$http.httpUrl('/system/gradeInfo/' + gradeInfo.id))
            .then(response => {
              this.$message.success('删除成功')
              this.getList()
            })
        })
      },

      addGrade () {
        this.clearFormData()
        this.showFlag = true
      },

      handleSelectionChange (val) {

      },

      checkData (select) {
        console.log(select)
      },

      batchDelete () { // 批量删除

      },

      sizeChangeHandler (val) {
        this.pageSize = val
        this.currentPage = 1
        this.loading = true
        this.getList()
      },

      currentChangeHandler (val) {
        this.currentPage = val
        this.loading = true
        this.getList()
      },

      saveOrUpdate () {
        let that = this
        that.$refs['form'].validate(function (valid, rules) {
          if (valid) {
            that.axios.post(that.$http.httpUrl('/system/gradeInfo/saveOrUpdate'), that.form)
              .then(function (response) {
                that.showFlag = false
                if (response.data.code === 1) {
                  that.$message({
                    type: 'success',
                    message: response.data.message
                  })
                  that.clearFormData()
                  that.getList()
                }
              }).catch(function (error) {
                console.log(error)
              })
          }
        })
      },

      // 注意 不能直接将item赋值给form
      updateGradeInfo (item) {
        this.form = {
          id: item.id,
          name: item.name,
          schoolType: item.schoolType
        }
        this.showFlag = true
      }

    },

    filters: {

      getSchoolTypeName (val) {
        for (let i in that.schoolTypeList) {
          let item = that.schoolTypeList[i]
          if (item.code === val) {
            return item.value
          }
        }
        return '无'
      }
    }
  }
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 90px;
    height: 90px;
    line-height: 90px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
