<template>
  <div class="mod-user">
    <el-table
      :data="onlineUserList"
      border
      v-loading="loading"
      style="width: 100%;">

      <el-table-column
        prop="loginName"
        header-align="center"
        align="center"
        width="120"
        label="账号">
      </el-table-column>

      <el-table-column
        prop="loginIp"
        header-align="center"
        align="center"
        width="150"
        label="登录ip">
      </el-table-column>

      <el-table-column
        prop="ipAddress"
        header-align="center"
        align="center"
        width="150"
        label="登录地点">
      </el-table-column>

      <el-table-column
        prop="lastLoginTime"
        header-align="center"
        align="center"
        min-width="120"
        label="登录时间">
      </el-table-column>

      <el-table-column
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button @click="$message.error('功能暂未开放，尽请期待')" size="small" icon="el-icon-bottom">下线</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
  </div>
</template>

<script>
  export default {
    name: 'onLineUser',
    data () {
      return {
        onlineUserList: [],
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        loading: true
      }
    },

    mounted () {
      this.getOnlineUserList()
    },

    methods: {

      currentChangeHandle (val) {
        this.loading = true
        this.pageNumber = val
        this.getOnlineUserList()
      },

      sizeChangeHandle (val) {
        this.loading = true
        this.pageNumber = 1
        this.pageSize = val
        this.getOnlineUserList()
      },

      // 获取数据列表
      getOnlineUserList () {
        this.axios.get(this.$http.httpUrl('/system/admin/getOnlineUserList'), {
          params: {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
          }
        }).then(response => {
          this.loading = false
          this.onlineUserList = response.data.data.dataList
          this.total = response.data.data.total
        })
      }
    }
  }
</script>

<style scoped>

</style>
