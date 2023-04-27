<template>
  <div class="mod-user">
    <div class="mod-user">
      <el-form :model="query" :inline="true" @keyup.enter.native="searchLanguagePoints()">
        <el-form-item>
          <el-input v-model="query.keyWord" clearable placeholder="知识点内容"></el-input>
        </el-form-item>

       <el-form-item>
          <el-button
            v-if="hasPermission(['system:languagePointsInfo:list'])"
            type="success"
            icon="el-icon-search" @click="searchLanguagePoints">查询</el-button>
         </el-form-item>

        <el-form-item>

        <el-button
          type="primary"
          v-if="hasPermission(['system:languagePointsInfo:save'])"
          @click="addRootLanguagePoints"
          icon="el-icon-plus" >新增根节点</el-button>
        </el-form-item>
      </el-form>

      <vxe-table
        resizable
        border="inner"
        ref="xTree"
        row-id="id"
        :tree-config="{lazy: true, children: 'children', hasChild: 'hasChildren', loadMethod: loadChildren}"
        :data="treeLanguagePointsList">
        <vxe-table-column
          width="400"
          field="name"
          title="知识点名称"
          tree-node>
        </vxe-table-column>

        <vxe-table-column
          width="150"
          align="center"
          title="科目">
          <template slot-scope="scope">
            <el-tag>{{subjectInfo.name}}</el-tag>
          </template>
        </vxe-table-column>

        <vxe-table-column
          width="150"
          align="center"
           title="年级">
          <template slot-scope="scope">
            <el-tag>{{subjectInfo.gradeName}}</el-tag>
          </template>
        </vxe-table-column>

        <vxe-table-column
          align="center"
          title="操作"
          min-width="100">
          <template slot-scope="scope">
            <el-button
              type="primary"
              v-if="hasPermission(['system:languagePointsInfo:save'])"
              @click="addLanguagePoints(scope.row)"
              icon="el-icon-plus"
              circle></el-button>
            <el-button
              @click="updateLanguagePoints(scope.row)"
              v-if="hasPermission(['system:languagePointsInfo:update'])"
              type="warning"
              icon="el-icon-edit" circle>
            </el-button>

            <el-button
              @click="deleteLanguagePoints(scope.row)"
              v-if="hasPermission(['system:languagePointsInfo:deleteById'])"
              type="danger" icon="el-icon-delete" circle>
            </el-button>
          </template>
        </vxe-table-column>
      </vxe-table>

      <el-dialog
        :title="!form.id ? '新增知识点' : '修改知识点'"
        :close-on-click-modal="false"
        :visible.sync="showFlag">
        <el-form :model="form" :rules="rules" ref="form" @keyup.enter.native="saveOrUpdateLanguagePoints()" label-width="120px">
          <el-form-item label="知识点内容" prop="name">
            <el-input v-model="form.name" placeholder="知识点内容"></el-input>
          </el-form-item>

          <el-form-item label="排序">
            <el-input v-model="form.sort" placeholder="排序(数字越小,排名越靠前)"></el-input>
          </el-form-item>

        </el-form>
        <span slot="footer"  class="dialog-footer">
          <el-button @click="showFlag = false">取消</el-button>
          <el-button type="primary" @click="saveOrUpdateLanguagePoints()">确定</el-button>
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
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  export default {
    name: 'languagePoints',
    data () {
      return {
        query: {
          keyWord: ''
        },
        form: {
          parentId: null,
          name: '',
          subjectId: null,
          gradeInfoId: null,
          sort: 0
        },
        rules: {
          name: {
            required: true, message: '请输入知识点内容', trigger: 'blur'
          }
        },
        gradeInfoId: null,
        showFlag: false,
        subjectId: null,
        pageSize: 10,
        totalCount: 0,
        currentPage: 1,
        loading: true,
        treeLanguagePointsList: []
      }
    },

    computed: {
      ...mapGetters({
        subjectInfo: 'map/getSubjectInfo'
      })
    },

    mounted () {
      this.subjectId = this.subjectInfo.id
      this.gradeInfoId = this.subjectInfo.gradeInfoId
      this.getTreeLanguagePointsList() // 获取最顶级父类知识点
    },

    methods: {

      sizeChangeHandler (val) {
        this.pageSize = val
        this.currentPage = 1
        this.getTreeLanguagePointsList()
      },

      currentChangeHandler (val) {
        this.currentPage = val
        this.getTreeLanguagePointsList()
      },

      addLanguagePoints (item) {
        this.form = {
          parentId: item.id,
          name: '',
          subjectId: this.subjectId,
          gradeInfoId: this.gradeInfoId,
          sort: 0
        }
        this.showFlag = true
      },

      updateLanguagePoints (item) {
        this.form = {
          id: item.id,
          parentId: item.parentId,
          name: item.name,
          subjectId: item.subjectId,
          gradeInfoId: item.gradeInfoId,
          sort: item.sort
        }
        this.showFlag = true
      },

      addRootLanguagePoints () {
        this.form = {
          parentId: 0,
          name: '',
          subjectId: this.subjectId,
          gradeInfoId: this.gradeInfoId,
          sort: 0
        }
        this.showFlag = true
      },

      deleteLanguagePoints (item) {
        this.$confirm('确定删除知识点' + item.name + '?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.axios.delete(this.$http.httpUrl('/system/languagePointsInfo/' + item.id))
            .then(response => {
              if (response.data.code === 1) {
                this.$message({
                  type: 'success',
                  message: response.data.message
                })
                this.getTreeLanguagePointsList()
              }
            })
        })
      },

      saveOrUpdateLanguagePoints () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.axios.post(this.$http.httpUrl('/system/languagePointsInfo/saveOrUpdate'), this.form)
                .then(response => {
                  this.showFlag = false
                  this.$message.success(response.data.message)
                  this.getTreeLanguagePointsList()
                })
          }
        })
      },

      loadChildren ({ row }) {
          // 异步加载子节点
        return new Promise((resolve) => {
          this.axios.get(this.$http.httpUrl('/system/languagePointsInfo/selectByParentId'), {
            params: {
              parentId: row.id
            }
          }).then(response => {
            resolve(response.data.data)
          })
        })
      },

      searchLanguagePoints () {
        this.currentPage = 1
        this.getTreeLanguagePointsList()
      },

      getTreeLanguagePointsList () {
        this.axios.get(this.$http.httpUrl('/system/languagePointsInfo/selectList'), {
          params: {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            subjectId: this.subjectId,
            name: this.query.keyWord,
            parentId: 0 // 查找顶级节点
          }
        }).then(response => {
          this.loading = false
          this.treeLanguagePointsList = response.data.data
        })
      }
    },

    filters: {

    }
  }
</script>
<style>
  .el-table__expand-icon {
    display: inline-block;
    margin-right: 15px;
    vertical-align:-5px;
  }
</style>
